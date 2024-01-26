import { useValidate } from '../lib/useValidate';

const { isString, isStrongPassword, isMongoId, isEmail } = useValidate();

export const Rules = {
  create: [
    isString('firstName', 'First name'),
    isString('lastName', 'Last name'),
    isEmail('email', 'Email address'),
    isString('bio', 'Bio')
      .isLength({ max: 256 })
      .withMessage('Bio cannot exceed 256 characters'),
    isStrongPassword('password', 'Password'),
  ],

  authenticate: [
    isEmail('email', 'Email'),
    isStrongPassword('password', 'Password'),
  ],

  get: [isMongoId('param', 'userId', 'User')],

  verify: [isEmail('email', 'Email address')],

  update: [
    isMongoId('body', 'userId', 'User'),
    isString('firstName', 'First name').optional(),
    isString('lastName', 'Last name').optional(),
    isString('bio', 'Bio')
      .optional()
      .isLength({ max: 256 })
      .withMessage('Bio cannot exceed 256 characters'),
    isStrongPassword('password', 'Password').optional(),
  ],

  uploadPhoto: [isMongoId('body', 'userId', 'User')],

  changeEmail: [
    isMongoId('param', 'userId', 'User'),
    isEmail('email', 'Email'),
    isStrongPassword('password', 'Password'),
  ],

  changePassword: [
    isMongoId('param', 'userId', 'User'),
    isStrongPassword('oldPassword', 'Old password'),
    isStrongPassword('newPassword', ' New password'),
  ],
};

export default Rules;
