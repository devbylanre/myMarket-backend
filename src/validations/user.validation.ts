import { body, param } from 'express-validator';

const base = [
  body('role', 'Role must be a string').optional().notEmpty().isString(),
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
  body('verification', 'Verification must be contain token key')
    .optional()
    .isObject(),
  body('verification.token', 'Verification token must be a non-empty string')
    .optional()
    .notEmpty()
    .isString(),
  body('photo', 'Photo must be contain token key').optional().isObject(),
];

const paramId = (name: string) => {
  return [param(name, 'Invalid user object id').isMongoId()];
};

const rules = {
  create: base,
  authenticate: base,
  get: paramId('id'),
  update: [...base, ...paramId('id')],
  verifyEmail: base,
};

export { rules };
