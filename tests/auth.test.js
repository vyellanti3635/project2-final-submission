const request = require('supertest');
const app = require('../app');
const User = require('../models/User');

jest.mock('../models/User');

describe('Auth Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Registration', () => {
    it('should show register page', async () => {
      const response = await request(app).get('/register');
      
      expect(response.status).toBe(200);
      expect(response.text).toContain('Create Account');
    });

    it('should reject short username', async () => {
      const response = await request(app)
        .post('/register')
        .send({
          username: 'ab',
          email: 'test@test.com',
          password: 'password123',
          confirmPassword: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.text).toContain('between 3 and 20');
    });

    it('should reject invalid email', async () => {
      const response = await request(app)
        .post('/register')
        .send({
          username: 'testuser',
          email: 'notanemail',
          password: 'password123',
          confirmPassword: 'password123'
        });

      expect(response.status).toBe(400);
    });

    it('should reject short password', async () => {
      const response = await request(app)
        .post('/register')
        .send({
          username: 'testuser',
          email: 'test@test.com',
          password: 'short',
          confirmPassword: 'short'
        });

      expect(response.status).toBe(400);
      expect(response.text).toContain('at least 8');
    });
  });

  describe('Login', () => {
    it('should show login page', async () => {
      const response = await request(app).get('/login');
      
      expect(response.status).toBe(200);
      expect(response.text).toContain('Login');
    });

    it('should reject empty username', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          username: '',
          password: 'password123'
        });

      expect(response.status).toBe(400);
    });

    it('should reject empty password', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          username: 'testuser',
          password: ''
        });

      expect(response.status).toBe(400);
    });
  });

  describe('Logout', () => {
    it('should redirect after logout', async () => {
      const response = await request(app).get('/logout');
      
      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/');
    });
  });
});
