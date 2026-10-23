const express = require('express');
const mongoose = require('mongoose');
const request = require('supertest');
const Attendance = require('../../models/Attendance');
const User = require('../../models/User');
const WorkSession = require('../../models/WorkSession');
const AuditService = require('../../services/auditService');
const attendanceRoutes = require('../../routes/attendance');
const {
  attendanceQueryRules,
  attendanceRules,
  correctionRules,
  validate
} = require('../../middlewares/validation');
const {
  clearTransactionTestDb,
  connectTransactionTestDb
} = require('../helpers/transactionTestDb');

const describeWithTestDatabase = process.env.MONGODB_TEST_URI ? describe : describe.skip;
const app = express();
app.use(express.json());
app.use('/api/attendance', attendanceRoutes);
app.use('/api/corrections', attendanceRoutes.correctionsRouter);

const validationApp = express();
validationApp.use(express.json());
validationApp.post('/attendance', attendanceRules, validate, (req, res) => res.sendStatus(201));
validationApp.get('/attendance', attendanceQueryRules, validate, (req, res) => res.sendStatus(200));
validationApp.post('/corrections', correctionRules, validate, (req, res) => res.sendStatus(201));

describe('validación HTTP de asistencia', () => {
  test('expone las correcciones en el path canónico y exige autenticación', async () => {
    await request(app)
      .post('/api/corrections')
      .send({})
      .expect(401);
  });

  test.each([
    ['attendance', { timestamp: '2025-01-01T13:00:00.000Z' }],
    ['workSession', { timestampSalida: '2025-01-01T14:00:00.000Z' }]
  ])('acepta targetType %s con su campo de fecha', async (targetType, proposedValues) => {
    await request(validationApp)
      .post('/corrections')
      .send({ targetType, targetId: new mongoose.Types.ObjectId().toString(), proposedValues, reason: 'Prueba' })
      .expect(201);
  });

  test('rechaza targetType antiguo, campos desconocidos y filtros NoSQL', async () => {
    await request(validationApp)
      .post('/corrections')
      .send({
        targetType: 'session',
        targetId: new mongoose.Types.ObjectId().toString(),
        proposedValues: { timestampSalida: '2025-01-01T14:00:00.000Z' },
        reason: 'Prueba'
      })
      .expect(400);

    await request(validationApp)
      .post('/attendance')
      .send({ type: 'entrada', unexpected: true })
      .expect(400);

    await request(validationApp)
      .get('/attendance?%24where=this.type')
      .expect(400);
  });
});

describeWithTestDatabase('rutas de asistencia con transacciones', () => {
  let token;

  beforeAll(async () => {
    await connectTransactionTestDb();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await clearTransactionTestDb();
    const employee = await User.create({
      nombreCompleto: 'Empleado de Prueba',
      numeroDocumento: '12345678',
      correoElectronico: 'empleado.prueba@example.test',
      password: 'PruebaSegura123',
      tipoUsuario: 'empleado'
    });
    token = employee.getSignedJwtToken();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('rechaza timestamps enviados por el cliente', async () => {
    await request(app)
      .post('/api/attendance')
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'entrada', timestamp: '2025-01-01T13:00:00.000Z' })
      .expect(400);

    expect(await Attendance.countDocuments()).toBe(0);
  });

  test('rechaza targetType fuera del contrato OpenAPI', async () => {
    await request(app)
      .post('/api/corrections')
      .set('Authorization', `Bearer ${token}`)
      .send({
        targetType: 'session',
        targetId: new mongoose.Types.ObjectId().toString(),
        proposedValues: { timestampSalida: '2025-01-01T14:00:00.000Z' },
        reason: 'Corrección de prueba'
      })
      .expect(400);
  });

  test('revierte la marca y la jornada si falla la escritura de auditoría', async () => {
    jest.spyOn(AuditService, 'registrarAccion').mockRejectedValueOnce(new Error('Fallo de auditoría'));

    await request(app)
      .post('/api/attendance')
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'entrada' })
      .expect(500);

    expect(await Attendance.countDocuments()).toBe(0);
    expect(await WorkSession.countDocuments()).toBe(0);
  });

  test('solo una entrada concurrente crea la jornada activa', async () => {
    const responses = await Promise.all([
      request(app)
        .post('/api/attendance')
        .set('Authorization', `Bearer ${token}`)
        .send({ type: 'entrada' }),
      request(app)
        .post('/api/attendance')
        .set('Authorization', `Bearer ${token}`)
        .send({ type: 'entrada' })
    ]);

    expect(responses.map(response => response.status).sort()).toEqual([201, 409]);
    expect(await WorkSession.countDocuments({ estado: 'activa' })).toBe(1);
  });
});