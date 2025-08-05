import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Config } from '.';
import { User } from '../entity/User';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: Config.db.host,
  port: Number(Config.db.port),
  username: Config.db.username,
  password: Config.db.password,
  database: Config.db.name,
  // Don't use this in production, it's for development only
  synchronize: Config.nodeEnv === 'test' || Config.nodeEnv === 'dev',
  logging: false,
  entities: [User],
  migrations: [],
  subscribers: [],
});
