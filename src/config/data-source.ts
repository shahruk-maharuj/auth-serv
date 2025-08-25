import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Config } from '.';

const isTestEnvironment = Config.NODE_ENV === 'test';

export const AppDataSource = new DataSource(
  isTestEnvironment
    ? {
        type: 'sqlite',
        database: ':memory:',
        // Synchronize schema automatically for tests
        synchronize: true,
        logging: false,
        entities: ['src/entity/*.{ts,js}'],
        migrations: [],
        subscribers: [],
      }
    : {
        type: 'postgres',
        host: Config.DB_HOST,
        port: Number(Config.DB_PORT),
        username: Config.DB_USERNAME,
        password: Config.DB_PASSWORD,
        database: Config.DB_NAME,
        // Don't use this in production. Always keep false
        synchronize: false,
        logging: false,
        entities: ['src/entity/*.{ts,js}'],
        migrations: ['src/migration/*.{ts,js}'],
        subscribers: [],
      },
);
