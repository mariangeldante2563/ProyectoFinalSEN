const { validateMarkTransition } = require('../../services/attendanceService');

describe('transiciones de marcas de asistencia', () => {
  const user = { activo: true };
  const openSession = { timestampEntrada: new Date('2025-01-01T13:00:00.000Z') };

  test('acepta entrada si el empleado no tiene jornada abierta', () => {
    expect(() => validateMarkTransition({
      type: 'entrada',
      user,
      openSession: null,
      timestamp: new Date('2025-01-01T13:00:00.000Z')
    })).not.toThrow();
  });

  test('rechaza entrada duplicada y empleado deshabilitado', () => {
    expect(() => validateMarkTransition({
      type: 'entrada', user, openSession,
      timestamp: new Date('2025-01-01T14:00:00.000Z')
    })).toThrow('Ya existe una jornada abierta');

    expect(() => validateMarkTransition({
      type: 'entrada', user: { activo: false }, openSession: null,
      timestamp: new Date()
    })).toThrow('no está habilitado');
  });

  test('rechaza salida sin jornada y salida anterior o igual a entrada', () => {
    expect(() => validateMarkTransition({
      type: 'salida', user, openSession: null, timestamp: new Date()
    })).toThrow('No existe una jornada abierta');

    for (const timestamp of [
      new Date('2025-01-01T13:00:00.000Z'),
      new Date('2025-01-01T12:59:00.000Z')
    ]) {
      expect(() => validateMarkTransition({ type: 'salida', user, openSession, timestamp }))
        .toThrow('posterior a la entrada');
    }
  });

  test('rechaza un tipo de marca desconocido', () => {
    expect(() => validateMarkTransition({
      type: 'pausa', user, openSession: null, timestamp: new Date()
    })).toThrow('debe ser entrada o salida');
  });
});
