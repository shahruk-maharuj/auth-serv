// validators/registerUserValidator.ts
import { checkSchema } from 'express-validator';

export default checkSchema({
  firstName: {
    in: ['body'],
    errorMessage: 'First name is required',
    notEmpty: true,
    trim: true,
  },
  lastName: {
    in: ['body'],
    errorMessage: 'Last name is required',
    notEmpty: true,
    trim: true,
  },
  email: {
    in: ['body'],
    errorMessage: 'Valid email is required',
    isEmail: true,
    normalizeEmail: true,
    trim: true,
  },
  password: {
    in: ['body'],
    errorMessage: 'Password must be at least 8 characters long',
    isLength: {
      options: { min: 8 },
    },
  },
});

// export default [body('email').notEmpty().withMessage('Email is required')];
