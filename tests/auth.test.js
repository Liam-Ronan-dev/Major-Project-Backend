import { createJWT } from '../src/modules/auth';
import { hashField, compareField } from '../src/modules/auth';
import request from 'supertest';
import app from '../src/index'; // your Express app export

describe('Auth API', () => {
  it('should register a new user', async () => {
    const randomEmailNumber = Math.floor(Math.random() * 1000000);
    const randomLicenseNumber = Math.floor(100000 + Math.random() * 900000);
    // always 6 digits: between 100000 and 999999

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: `test${Date.now()}${randomEmailNumber}@mail.com`,
        password: 'Password123!',
        licenseNumber: `${randomLicenseNumber}`, // 6 digits only
        role: 'doctor',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toMatch(/Awaiting admin approval/);
    expect(res.body.qrCode).toBeDefined();
    expect(res.body.email).toBeDefined();
  });

  it('should not allow duplicate email registration', async () => {
    const email = `test${Date.now()}@mail.com`;
    const licenseNumber = Math.floor(100000 + Math.random() * 900000);

    await request(app)
      .post('/api/auth/register')
      .send({
        email,
        password: 'Password123!',
        licenseNumber: `${licenseNumber}`,
        role: 'doctor',
      });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email, // same email
        password: 'Password123!',
        licenseNumber: `${licenseNumber + 1}`, // different license number
        role: 'doctor',
      });

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toMatch(/Email already exists/);
  });

  it('should not login with incorrect password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 't@t.com', // Use real test user
      password: 'WrongPassword123!',
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/Invalid email or password/);
  });

  it('should fail MFA if no session cookie', async () => {
    const res = await request(app).post('/api/auth/login/mfa').send({ totp: '123456' }); // Random OTP

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/Session expired/i);
  });
});

describe('Hashing utilities', () => {
  it('should hash and verify a field correctly', async () => {
    const password = 'Password123!';
    const hashed = await hashField(password);
    const match = await compareField(password, hashed);

    expect(match).toBe(true);
  });

  it('should fail on wrong password', async () => {
    const password = 'Password123!';
    const hashed = await hashField(password);
    const match = await compareField('WrongPassword', hashed);

    expect(match).toBe(false);
  });
});

describe('JWT Creation', () => {
  it('should create a JWT token for a user', () => {
    const fakeUser = { id: '123', role: 'doctor' };
    const token = createJWT(fakeUser);

    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3); // JWT parts
  });
});
