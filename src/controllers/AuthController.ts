import fs from 'fs';
import path from 'path';
import { NextFunction, Response } from 'express';
import { JwtPayload, sign } from 'jsonwebtoken';
import { Logger } from 'winston';
import { UserService } from '../services/UserService';
import { RegisterUserRequest } from '../types';
import { validationResult } from 'express-validator';
import createHttpError from 'http-errors';
import { Config } from '../config';
import { AppDataSource } from '../config/data-source';
import { RefreshToken } from '../entity/RefreshToken';

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

      let privateKey: Buffer;
      try {
        privateKey = fs.readFileSync(
          path.join(__dirname, '../../certs/private.pem'),
        );
      } catch {
        const error = createHttpError(500, 'Failed to read private key file');
        next(error);
        return;
      }

      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
      };

      const accessToken = sign(payload, privateKey, {
        algorithm: 'RS256',
        expiresIn: '1h', // 1h
        issuer: 'auth-service',
      });

      // persist the refresh token
      const msInYear = 1000 * 60 * 60 * 24 * 365;
      const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
      const newRefreshToken = await refreshTokenRepository.save({
        user: user,
        expiresAt: new Date(Date.now() + msInYear),
      });

      const refreshToken = sign(payload, Config.db.refreshTokenSecret!, {
        algorithm: 'HS256',
        expiresIn: '1y', // 1y
        issuer: 'auth-service',
        jwtid: String(newRefreshToken.id),
      });

      res.cookie('accessToken', accessToken, {
        domain: 'localhost',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60, // 1h
        httpOnly: true,
      });
      res.cookie('refreshToken', refreshToken, {
        domain: 'localhost',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24 * 365, // 1y
        httpOnly: true,
      });
      return res.status(201).json({ id: user.id });
    } catch (err) {
      next(err);
      return;
    }
  }
}
