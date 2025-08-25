import createHttpError from 'http-errors';
import { JwtPayload, sign } from 'jsonwebtoken';
import { Repository } from 'typeorm';
import { Config } from '../config';
import { RefreshToken } from '../entity/RefreshToken';
import { User } from '../entity/User';

export class TokenService {
  constructor(private refreshTokenRepository: Repository<RefreshToken>) {}

  generateAccessToken(payload: JwtPayload) {
    let privateKey: string;
    if (!Config.PRIVATE_KEY) {
      const error = createHttpError(500, 'Private key is not configured');
      throw error;
    }

    try {
      privateKey = Config.PRIVATE_KEY;
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
    const refreshToken = sign(payload, Config.db.refreshTokenSecret, {
      algorithm: 'HS256',
      expiresIn: '1y', // 1y
      issuer: 'auth-service',
      jwtid: String(payload.id),
    });
    return refreshToken;
  }

  async persistRefreshToken(user: User) {
    const msInYear = 1000 * 60 * 60 * 24 * 365;
    const newRefreshToken = await this.refreshTokenRepository.save({
      user: user,
      expiresAt: new Date(Date.now() + msInYear),
    });
    return newRefreshToken;
  }

  async deleteRefreshToken(tokenId: number) {
    return await this.refreshTokenRepository.delete({ id: tokenId });
  }
}
