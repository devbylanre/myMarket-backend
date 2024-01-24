import { useValidate } from '../lib/useValidate';

const { isString, isStrongPassword, isMongoId, isEmail } = useValidate();

const createRoute = [
  isString('firstName', 'First name'),
  isString('lastName', 'Last name'),
  isEmail('email', 'Email address'),
  isString('bio', 'Bio')
    .isLength({ max: 256 })
    .withMessage('Bio cannot exceed 255 characters'),
  isStrongPassword('password', 'Password'),
];

const authRoute = [
  isEmail('email', 'Email'),
  isStrongPassword('password', 'Password'),
];

const getRoute = [isMongoId('param', 'userId', 'User')];

const updateRoute = [isMongoId('param', 'userId', 'User')];

const verifyEmailRoute = [
  isEmail('email', 'Email'),
  isString('token', 'Verification token'),
];

const uploadPhotoRoute = [isMongoId('body', 'userId', 'User')];

const changeEmailRoute = [
  isEmail('oldEmail', ' Old email'),
  isEmail('newEmail', ' New email'),
  isStrongPassword('password', 'Password'),
];

const changePasswordRoute = [
  isEmail('email', ' Email'),
  isStrongPassword('oldPassword', 'Old password'),
  isStrongPassword('newPassword', ' New password'),
];

const generateOTPRoute = [isMongoId('body', 'userId', 'User')];

const verifyOTPRoute = [
  isMongoId('body', 'userId', 'User'),
  isString('code', 'One Time Password code')
    .isLength({ min: 6 })
    .withMessage('One Time Password must be 6 characters'),
];

const followRoute = [
  isMongoId('body', 'userId', 'User'),
  isMongoId('body', 'follower', 'Follower'),
];

export {
  createRoute,
  authRoute,
  getRoute,
  updateRoute,
  verifyEmailRoute,
  uploadPhotoRoute,
  changeEmailRoute,
  changePasswordRoute,
  generateOTPRoute,
  verifyOTPRoute,
  followRoute,
};
