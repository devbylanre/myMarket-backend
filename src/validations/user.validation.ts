import { useValidate } from '../lib/useValidate';

const { isString, isStrongPassword, isMongoId, isEmail } = useValidate();

const updateUserRoute = [
  isMongoId('body', 'userId', 'User'),
  isString('firstName', 'First name').optional(),
  isString('lastName', 'Last name').optional(),
  isString('bio', 'Bio')
    .optional()
    .isLength({ max: 256 })
    .withMessage('Bio cannot exceed 256 characters'),
  isStrongPassword('password', 'Password').optional(),
];

const getUserRoute = [isMongoId('body', 'userId', 'User')];

const uploadPhotoRoute = [isMongoId('body', 'userId', 'User')];

const changeEmailRoute = [
  isMongoId('body', 'userId', 'User'),
  isEmail('email', 'Email'),
  isStrongPassword('password', 'Password'),
];

const changePasswordRoute = [
  isMongoId('body', 'userId', 'User'),
  isStrongPassword('oldPassword', 'Old password'),
  isStrongPassword('newPassword', ' New password'),
];

export {
  updateUserRoute,
  getUserRoute,
  uploadPhotoRoute,
  changeEmailRoute,
  changePasswordRoute,
};
