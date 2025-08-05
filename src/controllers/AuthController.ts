import { NextFunction, Response } from 'express';
import { Logger } from 'winston';
import { UserService } from '../services/UserService';
import { RegisterUserRequest } from '../types';
import { validationResult } from 'express-validator';

export class AuthController {
  constructor(
    private userService: UserService,
    private logger: Logger,
  ) {}

  async register(req: RegisterUserRequest, res: Response, next: NextFunction) {
    // Validate request body
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({
        errors: result.array(),
      });
    }
    const { firstName, lastName, email, password } = req.body;
    this.logger.debug('New request to register user', {
      firstName,
      lastName,
      email,
      password: '******',
    });
    try {
      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
      });
      this.logger.info('User has been registered successfully', {
        userId: user.id,
      });
      res.status(201).json({ id: user.id });
    } catch (err) {
      next(err);
      return;
    }

    // Return dummy token just for testing
    return res.status(201).json({ token: 'dummy-token' });
  }
}
