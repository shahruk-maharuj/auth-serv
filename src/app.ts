import express, { NextFunction, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import { HttpError } from 'http-errors';
import 'reflect-metadata';
import logger from './config/logger';
import authRouter from './routes/auth';

const app = express();
app.use(express.static('public', { dotfiles: 'allow' }));
app.use(cookieParser());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to the Auth Service!');
});

app.use('/auth', authRouter);

// global error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message);
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    errors: [
      {
        type: err.name,
        msg: err.message,
        path: '',
        location: '',
      },
    ],
  });
});

export default app;
