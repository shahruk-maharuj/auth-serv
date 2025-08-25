import createJWKSMock from 'mock-jwks';
import request from 'supertest';
import { DataSource } from 'typeorm';
import app from '../../src/app';
import { AppDataSource } from '../../src/config/data-source';
import { Roles } from '../../src/constants';
import { Tenant } from '../../src/entity/Tenant';

describe('POST /tenants', () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;
  let adminToken: string;

  beforeAll(async () => {
    // Initialize JWKS mock and DB connection
    jwks = createJWKSMock('http://127.0.0.1:5501');
    await jwks.start();

    connection = await AppDataSource.initialize();

    // Generate admin token once for all tests
    adminToken = jwks.token({
      sub: '1',
      role: Roles.ADMIN,
    });
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
    it('should return a 201 status code', async () => {
      const tenantData = {
        name: 'Tenant 1',
        address: 'Address 1',
      };
      const response = await request(app)
        .post('/tenants')
        .set('Cookie', [`accessToken=${adminToken}`])
        .send(tenantData);
      expect(response.status).toBe(201);
    });

    it('should create a tenant in the database', async () => {
      const tenantData = {
        name: 'Tenant 1',
        address: 'Address 1',
      };

      await request(app)
        .post('/tenants')
        .set('Cookie', [`accessToken=${adminToken}`])
        .send(tenantData);

      const tenantRepository = connection.getRepository(Tenant);
      const tenants = await tenantRepository.find();

      expect(tenants).toHaveLength(1);
      expect(tenants[0].name).toBe(tenantData.name);
      expect(tenants[0].address).toBe(tenantData.address);
    });

    it('should return 401 if user is not authenticated', async () => {
      const tenantData = {
        name: 'Tenant 1',
        address: 'Address 1',
      };

      const response = await request(app).post('/tenants').send(tenantData);
      expect(response.statusCode).toBe(401);

      const tenantRepository = connection.getRepository(Tenant);
      const tenants = await tenantRepository.find();
      expect(tenants).toHaveLength(0);
    });

    it('should return 403 if user is not an admin', async () => {
      const managerToken = jwks.token({
        sub: '1',
        role: Roles.MANAGER,
      });

      const tenantData = {
        name: 'Tenant 1',
        address: 'Address 1',
      };

      const response = await request(app)
        .post('/tenants')
        .set('Cookie', [`accessToken=${managerToken}`])
        .send(tenantData);

      expect(response.statusCode).toBe(403);

      const tenantRepository = connection.getRepository(Tenant);
      const tenants = await tenantRepository.find();
      expect(tenants).toHaveLength(0);
    });
  });
});
