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
    connection = await AppDataSource.initialize();
    jwks = createJWKSMock('http://localhost:5501');
  });

  beforeEach(async () => {
    // Clean database before each test
    await connection.dropDatabase();
    await connection.synchronize();

    // Start JWKS mock server
    jwks.start();

    // Generate an admin JWT token
    adminToken = jwks.token({
      sub: '1',
      role: Roles.ADMIN,
    });
  });

  afterEach(() => {
    jwks.stop();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe('Given all fields', () => {
    it('should return a 201 status code', async () => {
      const tenantData = {
        name: 'Tenant name',
        address: 'Tenant address',
      };

      const response = await request(app)
        .post('/tenants')
        .set('Cookie', [`accessToken=${adminToken}`])
        .send(tenantData);

      expect(response.status).toBe(201);
    });

    it('should create a tenant in the database', async () => {
      const tenantData = {
        name: 'Tenant name',
        address: 'Tenant address',
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
        name: 'Tenant name',
        address: 'Tenant address',
      };

      const response = await request(app).post('/tenants').send(tenantData);

      expect(response.status).toBe(401);

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
        name: 'Tenant name',
        address: 'Tenant address',
      };

      const response = await request(app)
        .post('/tenants')
        .set('Cookie', [`accessToken=${managerToken}`])
        .send(tenantData);

      expect(response.status).toBe(403);

      const tenantRepository = connection.getRepository(Tenant);
      const tenants = await tenantRepository.find();
      expect(tenants).toHaveLength(0);
    });
  });
});
