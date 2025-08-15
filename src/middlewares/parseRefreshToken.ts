import { expressjwt } from 'express-jwt';
import { Config } from '../config';
import { Request } from 'express';
import { AuthCookies } from '../types';

export default expressjwt({
  secret: Config.db.refreshTokenSecret!,
  algorithms: ['HS256'],
  getToken(req: Request) {
    const { refreshToken } = req.cookies as AuthCookies;
    return refreshToken;
  },
});
