import app from './app';
import { Config } from './config';
import { AppDataSource } from './config/data-source';
import logger from './config/logger';

const startServer = async () => {
  const PORT = Config.port;
  try {
    await AppDataSource.initialize();
    logger.info('Database connection established successfully.');
    app.listen(PORT, () => {
      logger.warn('testing warning message...');
      logger.error('testing error message...');
      logger.debug('testing debug message...');
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    logger.error('Error starting server:', err);
    process.exit(1);
  }
};

void startServer();
