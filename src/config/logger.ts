import winston from 'winston';
import { Config } from '.';

const logger = winston.createLogger({
  level: 'info',
  defaultMeta: { service: 'auth-service' },
  transports: [
    new winston.transports.File({
      level: 'info',
      dirname: 'logs',
      filename: 'combined.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      silent: Config.nodeEnv === 'test',
    }),
    new winston.transports.File({
      level: 'error',
      dirname: 'logs',
      filename: 'error.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      silent: Config.nodeEnv === 'test',
    }),
    new winston.transports.Console({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      silent: Config.nodeEnv === 'test',
    }),
  ],
});

export default logger;
