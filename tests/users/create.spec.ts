import createJWKSMock from 'mock-jwks';
import request from 'supertest';
import { DataSource } from 'typeorm';
import app from '../../src/app';
import { AppDataSource } from '../../src/config/data-source';
import { Roles } from '../../src/constants';
import { User } from '../../src/entity/User';
import { Tenant } from '../../src/entity/Tenant';
import { createTenant } from '../utils';

describe('POST /users', () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;

  beforeAll(async () => {
    // Initialize JWKS mock and DB connection
    jwks = createJWKSMock('http://127.0.0.1:5501');
    await jwks.start();
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    // Clear database before each test
    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterAll(async () => {
    // Stop JWKS and destroy DB connection
    await jwks.stop();
    await connection.destroy();
  });

  describe('Given all fields', () => {
    it('should persist the user in the database', async () => {
      // Create tenant first
      const tenant = await createTenant(connection.getRepository(Tenant));

      const adminToken = jwks.token({
        sub: '1',
        role: Roles.ADMIN,
      });

      // Register user
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        tenantId: tenant.id,
        role: Roles.MANAGER,
      };

      await request(app)
        .post('/users')
        .set('Cookie', [`accessToken=${adminToken}`])
        .send(userData);

      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(1);
      expect(users[0].email).toBe(userData.email);
    });

    it('should create a manager user', async () => {
      const tenant = await createTenant(connection.getRepository(Tenant));

      const adminToken = jwks.token({
        sub: '1',
        role: Roles.ADMIN,
      });

      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        tenantId: tenant.id,
        role: Roles.MANAGER,
      };

      await request(app)
        .post('/users')
        .set('Cookie', [`accessToken=${adminToken}`])
        .send(userData);

      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(1);
      expect(users[0].role).toBe(Roles.MANAGER);
    });

    it('should return 403 if non admin user tries to create a user', async () => {
      const tenant = await createTenant(connection.getRepository(Tenant));

      const nonAdminToken = jwks.token({
        sub: '1',
        role: Roles.MANAGER,
      });

      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        tenantId: tenant.id,
      };

      const response = await request(app)
        .post('/users')
        .set('Cookie', [`accessToken=${nonAdminToken}`])
        .send(userData);

      expect(response.statusCode).toBe(403);

      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(0);
    });
  });
});
