import { config } from 'dotenv';
import path from 'path';

// Determine which env file to load
const envFile = process.env.NODE_ENV
  ? `.env.${process.env.NODE_ENV}`
  : '.env.dev'; // fallback for development

config({ path: path.join(__dirname, `../../${envFile}`) });

// Destructure environment variables
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

// Optional: throw if critical variables are missing
if (!DB_PASSWORD) {
  throw new Error('❌ DB_PASSWORD is missing from your environment file.');
}

export const Config = {
  port: PORT || '5501',
  nodeEnv: NODE_ENV || 'dev',
  db: {
    host: DB_HOST || 'localhost',
    port: DB_PORT || '5432',
    username: DB_USERNAME || 'postgres',
    password: DB_PASSWORD,
    name: DB_NAME || '',
    refreshTokenSecret: REFRESH_TOKEN_SECRET || 'secretKey',
  },
  jwks: {
    uri: JWKS_URI || '',
  },
};
