jest.mock('../../models/User', () => ({
  findById: jest.fn()
}));

const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const config = require('../../config/config');
const { protect } = require('../../middlewares/auth');

const response = () => {
  const res = { status: jest.fn(), json: jest.fn() };
  res.status.mockReturnValue(res);
  return res;
};

describe('auth.protect', () => {
  beforeEach(() => jest.clearAllMocks());

  test('authenticates a valid bearer token and attaches its user', async () => {
    const user = { id: 'user-id', tipoUsuario: 'empleado' };
    const token = jwt.sign({ id: user.id }, config.server.jwtSecret);
    User.findById.mockResolvedValue(user);
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = response();
    const next = jest.fn();

    await protect(req, res, next);

    expect(req.user).toBe(user);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('rejects a request without a bearer token', async () => {
    const req = { headers: {} };
    const res = response();

    await protect(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(User.findById).not.toHaveBeenCalled();
  });

  test('rejects an invalid token', async () => {
    const req = { headers: { authorization: 'Bearer invalid' } };
    const res = response();

    await protect(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(User.findById).not.toHaveBeenCalled();
  });
});
