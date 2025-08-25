import createJWKSMock from 'mock-jwks';
import request from 'supertest';
import { DataSource } from 'typeorm';
import app from '../../src/app';
import { AppDataSource } from '../../src/config/data-source';
import { Roles } from '../../src/constants';
import { User } from '../../src/entity/User';

describe('GET /auth/self', () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;

  beforeAll(async () => {
    // Initialize JWKS once
    jwks = createJWKSMock('http://127.0.0.1:5501');
    jwks.start();

    // Initialize database
    try {
      connection = await AppDataSource.initialize();
    } catch (err) {
      console.error('DB initialization failed:', err);
    }
  });

  beforeEach(async () => {
    // Reset database for each test
    if (connection && connection.isInitialized) {
      await connection.dropDatabase();
      await connection.synchronize();
    }
  });

  afterAll(async () => {
    // Stop JWKS
    if (jwks) jwks.stop();

    // Destroy database connection
    if (connection && connection.isInitialized) {
      await connection.destroy();
    }
  });

  describe('Given all fields', () => {
    it('should return 200 status code', async () => {
      const accessToken = jwks.token({ sub: '1', role: Roles.CUSTOMER });
      const response = await request(app)
        .get('/auth/self')
        .set('Cookie', [`accessToken=${accessToken};`])
        .send();

      expect(response.statusCode).toBe(200);
    });

    it('should return the user data', async () => {
      const userRepository = connection.getRepository(User);
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
      };
      const savedUser = await userRepository.save({
        ...userData,
        role: Roles.CUSTOMER,
      });

      const accessToken = jwks.token({
        sub: String(savedUser.id),
        role: savedUser.role,
      });
      const response = await request(app)
        .get('/auth/self')
        .set('Cookie', [`accessToken=${accessToken};`])
        .send();

      expect(response.body.id).toBe(savedUser.id);
    });

    it('should not return the password field', async () => {
      const userRepository = connection.getRepository(User);
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
      };
      const savedUser = await userRepository.save({
        ...userData,
        role: Roles.CUSTOMER,
      });

      const accessToken = jwks.token({
        sub: String(savedUser.id),
        role: savedUser.role,
      });
      const response = await request(app)
        .get('/auth/self')
        .set('Cookie', [`accessToken=${accessToken};`])
        .send();

      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 401 status code if token does not exist', async () => {
      const userRepository = connection.getRepository(User);
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
      };
      await userRepository.save({ ...userData, role: Roles.CUSTOMER });

      const response = await request(app).get('/auth/self').send();

      expect(response.statusCode).toBe(401);
    });
  });
});
