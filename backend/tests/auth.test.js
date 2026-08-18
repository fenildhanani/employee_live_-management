const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');

describe('Auth Endpoints Test Suite', () => {
  beforeAll(async () => {
    jest.setTimeout(30000);
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  it('GET /api/health should return 200 OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('OK');
  });

  it('POST /api/auth/login with bad credentials should handle authentication attempt', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'nonexistent@mordspark.com',
      password: 'WrongPassword'
    });
    expect([401, 500]).toContain(res.statusCode);
  });
});
