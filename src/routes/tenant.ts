import express, { NextFunction, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import logger from '../config/logger';
import { Roles } from '../constants';
import { TenantController } from '../controllers/TenantController';
import { Tenant } from '../entity/Tenant';
import authenticate from '../middlewares/authenticate';
import { canAccess } from '../middlewares/canAccess';
import { TenantService } from '../services/TenantService';
import { CreateTenantRequest } from '../types';
import tenantValidator from '../validators/tenant-validator';

const router = express.Router();

const tenantRepository = AppDataSource.getRepository(Tenant);
const tenantService = new TenantService(tenantRepository);
const tenantController = new TenantController(tenantService, logger);

router.post(
  '/',
  authenticate,
  canAccess([Roles.ADMIN]),
  tenantValidator,
  (req: CreateTenantRequest, res: Response, next: NextFunction) =>
    tenantController.create(req, res, next),
);

router.patch(
  '/:id',
  authenticate,
  canAccess([Roles.ADMIN]),
  tenantValidator,
  (req: CreateTenantRequest, res: Response, next: NextFunction) =>
    tenantController.update(req, res, next),
);

router.get('/', (req, res, next) => tenantController.getAll(req, res, next));
router.get('/:id', authenticate, canAccess([Roles.ADMIN]), (req, res, next) =>
  tenantController.getOne(req, res, next),
);

router.delete(
  '/:id',
  authenticate,
  canAccess([Roles.ADMIN]),
  (req, res, next) => tenantController.destroy(req, res, next),
);

export default router;
