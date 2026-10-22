const { hasRole, isAdmin, isOwnerOrAdmin, getUserRole } = require('../../middlewares/roles');

async function invoke(middleware, user, extra = {}) {
  const req = { user, ...extra };
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    }
  };
  let nextCalled = false;
  await middleware(req, res, () => { nextCalled = true; });
  await new Promise(resolve => setImmediate(resolve));
  return { req, res, nextCalled };
}

describe('middleware de roles basado en tipoUsuario', () => {
  test('reconoce administradores y empleados con las claims existentes', async () => {
    expect(getUserRole({ tipoUsuario: 'administrador' })).toBe('administrador');
    expect(getUserRole({ tipoUsuario: 'empleado' })).toBe('empleado');
    expect((await invoke(isAdmin, { tipoUsuario: 'administrador' })).nextCalled).toBe(true);
  });

  test('mantiene compatibilidad con el alias admin y rechaza roles no autorizados', async () => {
    expect((await invoke(isAdmin, { role: 'admin' })).nextCalled).toBe(true);
    const result = await invoke(hasRole('administrador'), { tipoUsuario: 'empleado' });
    expect(result.res.statusCode).toBe(403);
    expect(result.nextCalled).toBe(false);
  });

  test('limita la propiedad al empleado autenticado o a un administrador', async () => {
    const middleware = isOwnerOrAdmin(async () => 'employee-1');
    const owner = { user: { _id: 'employee-1', tipoUsuario: 'empleado' } };
    const ownerRes = await invoke(middleware, owner.user);
    expect(ownerRes.nextCalled).toBe(true);

    const denied = await invoke(middleware, { _id: 'employee-2', tipoUsuario: 'empleado' });
    expect(denied.res.statusCode).toBe(403);
  });
});
