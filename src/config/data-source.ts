import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Config } from '.';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: Config.db.host,
  port: Number(Config.db.port),
  username: Config.db.username,
  password: Config.db.password,
  database: Config.db.name,
  // Don't use this in production, Always keep synchronize false
  synchronize: false,
  logging: false,
  entities: ['src/entity/*.{ts,js}'],
  migrations: ['src/migrations/*.{ts,js}'],
  subscribers: [],
});
