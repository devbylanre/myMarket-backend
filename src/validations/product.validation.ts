import { body, param } from 'express-validator';
import { useValidate } from '../lib/useValidate';

const { isString, isMongoId, isNumber } = useValidate();

const Rules = {
  create: [
    isString('title', 'Product title'),
    isString('tagline', 'Product tagline'),
    isString('description', 'Product description'),
    isString('category', 'Product category'),
    isString('brand', 'Product brand'),
    isString('model', 'Product model'),
    isNumber('price', 'Product price'),
    isNumber('discount', 'Product discount'),
    isMongoId('body', 'postedBy', 'User'),
  ],

  update: [
    isString('title', 'Product title').optional(),
    isString('tagline', 'Product tagline').optional(),
    isString('description', 'Product description').optional(),
    isString('category', 'Product category').optional(),
    isString('brand', 'Product brand').optional(),
    isString('model', 'Product model').optional(),
    isNumber('price', 'Product price').optional(),
    isNumber('discount', 'Product discount').optional(),
    isMongoId('param', 'productId', 'Product'),
  ],

  delete: [isMongoId('param', 'productId', 'Product')],

  getOne: [isMongoId('param', 'productId', 'Product')],

  getForUser: [isMongoId('param', 'userId', 'Product')],
};

export default Rules;
