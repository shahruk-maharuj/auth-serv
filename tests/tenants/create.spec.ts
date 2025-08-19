import { DataSource } from 'typeorm';
import request from 'supertest';
import { AppDataSource } from '../../src/config/data-source';
import app from '../../src/app';

describe('POST /tenants', () => {
  let connection: DataSource;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    // database truncate
    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe('Given all fields', () => {
    it('should return a 201 status code', async () => {
      const tenantData = {
        name: 'Tenant 1',
        address: 'Address 1',
      };
      const response = await request(app).post('/tenants').send(tenantData);
      expect(response.status).toBe(201);
    });
  });
});
