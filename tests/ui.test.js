const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const BlogPost = require('../models/BlogPost');
const User = require('../models/User');

// Mock mongoose connection
jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return {
    ...actual,
    connect: jest.fn().mockResolvedValue(true),
  };
});

describe('UI Tests', () => {
  beforeAll(() => {
    // Mock BlogPost.find to return empty array
    jest.spyOn(BlogPost, 'find').mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue([])
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('Home Page', () => {
    it('should render home page with correct title', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.text).toContain('Personal Blog Platform');
      expect(response.text).toContain('Web Development Insights');
    });

    it('should have navigation links', async () => {
      const response = await request(app).get('/');
      
      expect(response.text).toContain('href="/"');
      expect(response.text).toContain('href="/search"');
      expect(response.text).toContain('href="/contact"');
      expect(response.text).toContain('href="/login"');
    });
  });

  describe('Login Page', () => {
    it('should render login form', async () => {
      const response = await request(app).get('/login');
      
      expect(response.status).toBe(200);
      expect(response.text).toContain('Login');
      expect(response.text).toContain('type="text"');
      expect(response.text).toContain('type="password"');
      expect(response.text).toContain('action="/login"');
    });
  });

  describe('Contact Page', () => {
    it('should render contact form with all fields', async () => {
      const response = await request(app).get('/contact');
      
      expect(response.status).toBe(200);
      expect(response.text).toContain('Contact Us');
      expect(response.text).toContain('name="name"');
      expect(response.text).toContain('name="email"');
      expect(response.text).toContain('name="subject"');
      expect(response.text).toContain('name="message"');
    });
  });

  describe('404 Page', () => {
    it('should render 404 page for invalid routes', async () => {
      const response = await request(app).get('/nonexistent-page');
      
      expect(response.status).toBe(404);
      expect(response.text).toContain('404');
    });
  });
});
