const request = require('supertest');
const app = require('../src/app');

describe('Health check', () => {
  it('GET /health returns 200', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('Greet endpoint', () => {
  it('returns greeting with name', async () => {
    const res = await request(app).get('/api/greet?name=DevOps');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Hello, DevOps!');
  });

  it('returns 400 if name missing', async () => {
    const res = await request(app).get('/api/greet');
    expect(res.statusCode).toBe(400);
  });
});

describe('Echo endpoint', () => {
  it('echoes back the body', async () => {
    const res = await request(app).post('/api/echo').send({ key: 'value' });
    expect(res.statusCode).toBe(200);
    expect(res.body.received.key).toBe('value');
  });
});