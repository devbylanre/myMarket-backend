import { useValidate } from '../lib/useValidate';

const { isString, isNumber, isEmail, isMongoId } = useValidate();

const createRoute = [
  isMongoId('body', 'user.id', 'User'),
  isString('user.name', 'User name'),
  isEmail('user.email', 'User email'),
  isNumber('length', 'Length'),
  isNumber('expiry', 'Expiry'),
];

const validateRoute = [
  isMongoId('param', 'reference', 'Reference'),
  isString('otp', 'One Time Password'),
];

export { createRoute, validateRoute };
