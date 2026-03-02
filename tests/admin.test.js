const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const BlogPost = require('../models/BlogPost');
const Comment = require('../models/Comment');

jest.mock('../models/User');
jest.mock('../models/BlogPost');
jest.mock('../models/Comment');

describe('Admin Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Dashboard Access', () => {
    it('should redirect to login when not authenticated', async () => {
      const response = await request(app).get('/admin');

      expect(response.status).toBe(302);
      expect(response.headers.location).toContain('/login');
    });
  });

  describe('Create Post Access', () => {
    it('should redirect to login when trying to create post', async () => {
      const response = await request(app)
        .post('/admin/posts')
        .send({ title: 'Test', content: 'test content' });

      expect(response.status).toBe(302);
    });

    it('should redirect when accessing new post form', async () => {
      const response = await request(app).get('/admin/posts/new');

      expect(response.status).toBe(302);
    });
  });

  describe('Comments Management', () => {
    it('should redirect to login for comments page', async () => {
      const response = await request(app).get('/admin/comments');

      expect(response.status).toBe(302);
    });
  });

  describe('Users Management', () => {
    it('should redirect to login for users page', async () => {
      const response = await request(app).get('/admin/users');

      expect(response.status).toBe(302);
    });
  });
});
