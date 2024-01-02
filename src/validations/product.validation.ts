import { NextFunction, Request, Response } from 'express';
import { body, check, param, validationResult } from 'express-validator';
import { handleResponse } from '../utils/res.util';

const baseValidation = [
  body('title', 'Title must be a non-empty string')
    .optional()
    .isString()
    .notEmpty(),
  body('tagline', 'Tagline must be a non-empty string')
    .optional()
    .isString()
    .notEmpty(),
  body('description', 'Description must be a non-empty string')
    .optional()
    .isString()
    .notEmpty(),
  body('brand', 'Brand must be a non-empty string')
    .optional()
    .isString()
    .notEmpty(),
  body('model', 'Model must be a non-empty string')
    .optional()
    .isString()
    .notEmpty(),
  body('category', 'Category must be a non-empty string')
    .optional()
    .isString()
    .notEmpty(),
  body('images', 'Images must be a non-empty array')
    .optional()
    .isArray({ min: 1 }),
  body('tags', 'Tags must be a non-empty array').optional().isArray({ min: 1 }),
  body('tags.*', 'Each tag must be a non-empty string')
    .optional()
    .isString()
    .notEmpty(),
  body('price', 'Price must be a numeric value').optional().isNumeric(),
  body('discount', 'Discount must be a numeric value').optional().isNumeric(),
  body('user', 'User must be a valid MongoDB ObjectId').optional().isMongoId(),
];

const validateParam = [
  param('id', 'Product id must be a valid Object id').isMongoId(),
];

const rules = {
  create: baseValidation,
  update: [...validateParam, ...baseValidation],
  delete: validateParam,
  fetch: validateParam,
};

const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  // return a json error object if errors is not empty
  if (!errors.isEmpty()) {
    return handleResponse.error({
      res: res,
      status: 500,
      message: errors.array(),
    });
  }

  return next();
};

export { validate, rules };
