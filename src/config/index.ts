import { config } from 'dotenv';
import path from 'path';
config({ path: path.join(__dirname, `../../.env.${process.env.NODE_ENV}`) });

const {
  PORT,
  NODE_ENV,
  DB_HOST,
  DB_PORT,
  DB_USERNAME,
  DB_PASSWORD,
  DB_NAME,
  REFRESH_TOKEN_SECRET,
  JWKS_URI,
} = process.env;

export const Config = {
  port: PORT,
  nodeEnv: NODE_ENV,
  db: {
    host: DB_HOST,
    port: DB_PORT,
    username: DB_USERNAME,
    password: DB_PASSWORD,
    name: DB_NAME,
    refreshTokenSecret: REFRESH_TOKEN_SECRET,
  },
  jwks: {
    uri: JWKS_URI,
  },
};
