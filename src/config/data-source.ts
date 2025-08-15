import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Config } from '.';
import { RefreshToken } from '../entity/RefreshToken';
import { User } from '../entity/User';

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
  entities: [User, RefreshToken],
  migrations: ['src/migrations/*.ts'],
  subscribers: [],
});
