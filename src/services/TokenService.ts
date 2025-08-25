import fs from 'node:fs';
import path from 'node:path';
import { generateKeyPairSync } from 'node:crypto';
import { JwtPayload, sign } from 'jsonwebtoken';
import createHttpError from 'http-errors';
import { Config } from '../config';
import { RefreshToken } from '../entity/RefreshToken';
import { User } from '../entity/User';
import { Repository } from 'typeorm';

export class TokenService {
  constructor(private refreshTokenRepository: Repository<RefreshToken>) {}
  private static cachedPrivateKey: Buffer | null = null;

  private static loadPrivateKey(): Buffer {
    if (this.cachedPrivateKey) {
      return this.cachedPrivateKey;
    }

    // Prefer PRIVATE_KEY from env (PEM or base64-encoded PEM)
    const envKey = Config.PRIVATE_KEY;
    if (envKey && envKey.trim().length > 0) {
      const keyContent = envKey.includes('BEGIN')
        ? envKey
        : Buffer.from(envKey, 'base64').toString('utf-8');
      this.cachedPrivateKey = Buffer.from(keyContent);
      return this.cachedPrivateKey;
    }

    // Fallback to reading from certs/private.pem
    try {
      this.cachedPrivateKey = fs.readFileSync(
        path.join(__dirname, '../../certs/private.pem'),
      );
      return this.cachedPrivateKey;
    } catch {
      // As a last resort in tests, generate an ephemeral RSA key
      if (Config.NODE_ENV === 'test') {
        const { privateKey } = generateKeyPairSync('rsa', {
          modulusLength: 2048,
          publicExponent: 0x10001,
          publicKeyEncoding: { type: 'spki', format: 'pem' },
          privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
        });
        this.cachedPrivateKey = Buffer.from(privateKey);
        return this.cachedPrivateKey;
      }
      const error = createHttpError(500, 'Error while reading private key');
      throw error;
    }
  }
  generateAccessToken(payload: JwtPayload) {
    const privateKey = TokenService.loadPrivateKey();
    const accessToken = sign(payload, privateKey, {
      algorithm: 'RS256',
      expiresIn: '1d',
      issuer: 'auth-service',
    });

    return accessToken;
  }

  generateRefreshToken(payload: JwtPayload) {
    const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!, {
      algorithm: 'HS256',
      expiresIn: '1y',
      issuer: 'auth-service',
      jwtid: String(payload.id),
    });

    return refreshToken;
  }

  async persistRefreshToken(user: User) {
    const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365; // 1Y -> (Leap year)

    const newRefreshToken = await this.refreshTokenRepository.save({
      user: user,
      expiresAt: new Date(Date.now() + MS_IN_YEAR),
    });
    return newRefreshToken;
  }

  async deleteRefreshToken(tokenId: number) {
    return await this.refreshTokenRepository.delete({ id: tokenId });
  }
}
