import app from './app';
import { Config } from './config';
import logger from './config/logger';

const startServer = () => {
  const PORT = Config.port;
  try {
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

startServer();
