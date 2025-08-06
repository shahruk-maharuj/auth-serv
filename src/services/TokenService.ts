import fs from 'fs';
import createHttpError from 'http-errors';
import { JwtPayload, sign } from 'jsonwebtoken';
import path from 'path';
import { Config } from '../config';

export class TokenService {
  generateAccessToken(payload: JwtPayload) {
    let privateKey: Buffer;
    try {
      privateKey = fs.readFileSync(
        path.join(__dirname, '../../certs/private.pem'),
      );
    } catch {
      const error = createHttpError(500, 'Failed to read private key file');
      throw error;
    }

    const accessToken = sign(payload, privateKey, {
      algorithm: 'RS256',
      expiresIn: '1h', // 1h
      issuer: 'auth-service',
    });
    return accessToken;
  }

  generateRefreshToken(payload: JwtPayload) {
    const refreshToken = sign(payload, Config.db.refreshTokenSecret!, {
      algorithm: 'HS256',
      expiresIn: '1y', // 1y
      issuer: 'auth-service',
      jwtid: String(payload.id),
    });
    return refreshToken;
  }
}
