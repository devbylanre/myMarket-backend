import { body, param } from 'express-validator';

export const validate = {
  create: [
    body('firstName')
      .trim()
      .not()
      .isEmpty()
      .withMessage('Provide your first name')
      .isString()
      .withMessage('First name must be a string'),
    body('lastName')
      .trim()
      .not()
      .isEmpty()
      .withMessage('Provide your last name')
      .isString()
      .withMessage('Last name must be a string'),
    body('email')
      .trim()
      .not()
      .isEmpty()
      .withMessage('Provide your email address')
      .isEmail()
      .withMessage('Provide a valid email address e.g team@google.com'),
    body('bio')
      .trim()
      .not()
      .isEmpty()
      .withMessage('Provide your biography')
      .isString()
      .withMessage('Biography must contain string characters')
      .isLength({ min: 100, max: 256 })
      .withMessage(
        'Biography require minimum of 100 and maximum of 256 characters'
      ),
    body('password')
      .isStrongPassword()
      .withMessage(
        'Use a strong password containing at least one uppercase, lowercase, number and special character'
      ),
  ],

  authenticate: [
    body('email')
      .trim()
      .not()
      .isEmpty()
      .withMessage('Provide your email address')
      .isEmail()
      .withMessage('Provide a valid email address e.g team@google.com'),
    body('password')
      .isStrongPassword()
      .withMessage(
        'Use a strong password containing at least one uppercase, lowercase, number and special character'
      ),
  ],

  paramMongoID: [param('id').isMongoId().withMessage('Invalid User ID')],

  verifyOTP: [
    param('id').isMongoId().withMessage('Invalid User ID'),
    body('code')
      .trim()
      .not()
      .isEmpty()
      .withMessage('Provide your one time password')
      .isString()
      .withMessage('One time password must contain only string')
      .isLength({ min: 6, max: 6 })
      .withMessage('One time password must be at least 6 characters in length'),
  ],

  verifyEmail: [
    body('email')
      .trim()
      .not()
      .isEmpty()
      .withMessage('Provide your email address')
      .isEmail()
      .withMessage('Provide a valid email address e.g team@google.com'),
  ],

  changePassword: [
    body('password.old')
      .trim()
      .not()
      .isEmpty()
      .withMessage('Provide your previous password'),
    body('password.new')
      .trim()
      .isStrongPassword()
      .withMessage(
        'Provide a password with at least one uppercase, lowercase, number, and special characters'
      ),
  ],

  changeEmail: [
    body('email')
      .trim()
      .not()
      .isEmpty()
      .withMessage('Provide your email address')
      .isEmail()
      .withMessage('Provide your email address'),
    body('password')
      .trim()
      .not()
      .isEmpty()
      .withMessage('Provide your previous password'),
  ],
};
