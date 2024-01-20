import { NextFunction, Request, Response } from 'express';
import {
  body,
  param,
  ValidationChain,
  validationResult,
} from 'express-validator';
import { handleResponse } from '../utils/res.util';

const baseValidation = [
  body('isSeller', 'isSeller must be a boolean').optional().isBoolean(),
  body('balance', 'Balance must be a number').optional().isNumeric(),
  body('firstName', 'First name must be a string')
    .optional()
    .isString()
    .notEmpty(),
  body('lastName', 'Last name must be a string')
    .optional()
    .isString()
    .notEmpty(),
  body('bio', 'Bio must be a string').optional().isString().notEmpty(),
  body(
    'password',
    'Use a strong password containing at least one uppercase, lowercase, number and special character'
  )
    .optional()
    .isStrongPassword(),
  body('email', 'Email must be a valid email address').optional().isEmail(),
  body('mobile', 'Mobile must be an object and not empty')
    .optional()
    .isObject()
    .notEmpty(),
  body('mobile.country', 'Mobile country must be a string')
    .optional()
    .isString()
    .notEmpty(),
  body('mobile.code', 'Mobile code must be a number')
    .optional()
    .isNumeric()
    .notEmpty(),
  body('mobile.number', 'Mobile number must be a number')
    .optional()
    .isNumeric()
    .notEmpty(),
  body('billing', 'Billing must be an object and not empty')
    .optional()
    .isObject()
    .notEmpty(),
  body('billing.country', 'Billing country must be a string')
    .optional()
    .isString()
    .notEmpty(),
  body('billing.state', 'Billing state must be a string')
    .optional()
    .isString()
    .notEmpty(),
  body('billing.city', 'Billing city must be a string').optional().isString(),
  body('billing.address', 'Billing address must be a string')
    .optional()
    .isString()
    .notEmpty(),
  body('store', 'Store must be an object and not empty')
    .optional()
    .isObject()
    .notEmpty(),
  body('store.name', 'Store name must be a string').optional().isString(),
  body('store.description', 'Store description must be a string')
    .optional()
    .isString()
    .notEmpty(),
  body('store.location', 'Store location must be an object and not empty')
    .optional()
    .isObject()
    .notEmpty(),
  body('store.location.country', 'Store location country must be a string')
    .optional()
    .isString()
    .notEmpty(),
  body('store.location.state', 'Store location state must be a string')
    .optional()
    .isString()
    .notEmpty(),
  body('store.location.city', 'Store location city must be a string')
    .optional()
    .isString()
    .notEmpty(),
  body('store.location.address', 'Store location address must be a string')
    .optional()
    .isString()
    .notEmpty(),
  body('accounts', 'Accounts must be an array').optional().isArray(),
  body('accounts.*.platform', 'Accounts platform must be a string')
    .optional()
    .isString()
    .notEmpty(),
  body('accounts.*.url', 'Accounts url must be a string')
    .optional()
    .isString()
    .notEmpty(),
];

const newEmail = [
  body('newEmail', 'New email address must be a valid email address')
    .optional()
    .isEmail(),
];

const code = [
  body('code', 'OTP code must be a string').optional().isString().notEmpty(),
];

const token = [
  body('token', 'Verification token must be a string')
    .optional()
    .isString()
    .notEmpty(),
];

const validateObjectId = (paramName: string) => {
  return [param(paramName, 'Invalid user object id').isMongoId()];
};

const rules = {
  create: baseValidation,
  authentication: baseValidation,
  verify: baseValidation,
  fetch: validateObjectId('id'),
  fetchProducts: validateObjectId('id'),
  update: [...validateObjectId('id'), ...baseValidation],
  photoUpload: baseValidation,
  verifyEmail: [...token, ...baseValidation],
  changeEmail: [...newEmail, ...baseValidation],
  generateOTP: baseValidation,
  verifyOTP: [...code, ...baseValidation],
};

const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  // check if errors is not empty and return a json error
  if (!errors.isEmpty()) {
    return handleResponse.error({
      res: res,
      status: 422,
      message: errors.array().forEach((error, i) => i === 0 && error.msg),
    });
  }

  return next();
};

export { rules, validate };
