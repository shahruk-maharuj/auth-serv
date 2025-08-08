// validators/registerUserValidator.ts
import { checkSchema } from 'express-validator';

export default checkSchema({
  email: {
    in: ['body'],
    errorMessage: 'Valid email is required',
    notEmpty: true,
    isEmail: true,
    normalizeEmail: true,
    trim: true,
  },
  password: {
    in: ['body'],
    errorMessage: 'Password must be at least 8 characters long',
    notEmpty: true,
  },
});

// export default [body('email').notEmpty().withMessage('Email is required')];
