import { NextFunction, Response } from 'express';
import { Logger } from 'winston';
import { TenantService } from '../services/TenantService';
import { CreateTenantRequest } from '../types';

export class TenantController {
  constructor(
    private tenantService: TenantService,
    private logger: Logger,
  ) {}
  async create(req: CreateTenantRequest, res: Response, next: NextFunction) {
    const { name, address } = req.body;

    try {
      const tenant = await this.tenantService.create({ name, address });
      this.logger.info('Tenant created successfully', {
        tenantId: tenant.id,
      });
      res.status(201).json({
        message: 'Tenant created successfully',
        id: tenant.id,
      });
    } catch (err) {
      next(err);
    }
  }
}
