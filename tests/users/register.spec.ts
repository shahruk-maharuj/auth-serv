import request from 'supertest';
import app from '../../src/app';

describe('POST /auth/register', () => {
  describe('Given all fields', () => {
    it('should return 201 status code', async () => {
      // AAA
      // Arrange
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
      };
      // Act
      const response = await request(app).post('/auth/register').send(userData);
      // Assert
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('token');
    });
  });
  describe('Fields are missing', () => {
    it('should return 400 status code', () => {
      // Test implementation
    });
  });
});
