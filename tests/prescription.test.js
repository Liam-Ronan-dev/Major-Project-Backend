import request from 'supertest';
import app from '../src/index';

describe('Prescriptions API (unauthenticated)', () => {
  it('should reject unauthenticated access', async () => {
    const res = await request(app).get('/api/prescriptions');
    expect(res.statusCode).toBe(401); // Unauthorized
  });
});
