import { body, param } from 'express-validator';

interface IValidate {
  field: string;
  msgPrefix: string;
}

interface IValidateMongoId extends IValidate {
  isParam?: boolean;
}

const helper = {
  validateString: ({ field, msgPrefix }: IValidate) => {
    return body(field)
      .trim()
      .notEmpty()
      .withMessage(`Provide your ${msgPrefix}`)
      .isString()
      .withMessage(`${msgPrefix} must be a string`);
  },

  validateEmail: ({ field, msgPrefix }: IValidate) => {
    return body(field)
      .trim()
      .notEmpty()
      .withMessage(`Provide your ${msgPrefix}`)
      .isEmail()
      .withMessage(`Provide a valid ${msgPrefix} e.g team@google.com`);
  },

  validatePassword: ({ field, msgPrefix }: IValidate) => {
    body(field)
      .isStrongPassword()
      .withMessage(
        `Use a strong ${msgPrefix} containing at least one uppercase, lowercase, number and special character`
      );
  },

  validateMongoID: ({ field, msgPrefix, isParam = true }: IValidateMongoId) => {
    if (isParam) {
      return param(field).isMongoId().withMessage(`Invalid ${msgPrefix} iD`);
    }
  },
};

export const validate = {
  create: () => {
    return [
      helper.validateString({ field: 'firstName', msgPrefix: 'first name' }),
      helper.validateString({ field: 'lastName', msgPrefix: 'last name' }),
      helper.validateEmail({ field: 'email', msgPrefix: 'email address' }),
      helper
        .validateString({ field: 'bio', msgPrefix: 'bio' })
        .isLength({ min: 100, max: 256 })
        .withMessage(
          'Biography require minimum of 100 and maximum of 256 characters'
        ),
      helper.validatePassword({ field: 'password', msgPrefix: 'password' }),
    ];
  },

  authenticate: () => {
    return [
      helper.validateEmail({ field: 'email', msgPrefix: 'email address' }),
      helper.validatePassword({ field: 'password', msgPrefix: 'password' }),
    ];
  },

  verifyToken: () => {
    return [
      helper.validateMongoID({
        field: 'token',
        msgPrefix: 'verification token',
      }),
    ];
  },

  update: () => {
    return [helper.validateMongoID({ field: 'id', msgPrefix: 'user Id' })];
  },

  fetch: () => {
    return [helper.validateMongoID({ field: 'id', msgPrefix: 'user Id' })];
  },

  fetchProducts: () => {
    return [helper.validateMongoID({ field: 'id', msgPrefix: 'user Id' })];
  },

  createOTP: () => {
    return [helper.validateMongoID({ field: 'id', msgPrefix: 'user Id' })];
  },

  verifyOTP: [
    param('id').isMongoId().withMessage('Invalid User ID'),
    helper
      .validateString({ field: 'code', msgPrefix: 'One Time Password' })
      .isLength({ min: 6, max: 6 })
      .withMessage('One time password must be at least 6 characters in length'),
  ],

  verifyEmail: [
    helper.validateEmail({ field: 'email', msgPrefix: 'email address' }),
  ],

  changePassword: () => {
    return [
      helper.validateString({
        field: 'password.old',
        msgPrefix: 'old password',
      }),
      helper.validatePassword({
        field: 'password.new',
        msgPrefix: 'new password',
      }),
    ];
  },

  changeEmail: [
    helper.validateEmail({ field: 'email', msgPrefix: 'email address' }),
    helper.validateString({ field: 'password', msgPrefix: 'password' }),
  ],

  uploadPhoto: () => {
    return [helper.validateMongoID({ field: 'id', msgPrefix: 'user Id' })];
  },
};
