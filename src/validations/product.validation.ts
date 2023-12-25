import { body, param } from 'express-validator';

interface IValidateField {
  field: string;
  maxLength: number;
  msgPrefix: string;
}

const helper = {
  validateString: ({
    field,
    msgPrefix,
  }: {
    field: string;
    msgPrefix: string;
  }) => {
    return body(field)
      .trim()
      .notEmpty()
      .withMessage(`${msgPrefix} is required`)
      .isString()
      .withMessage(`${msgPrefix} must be a string`);
  },

  validateIsMongoId: ({
    isParam = false,
    field,
    message,
  }: {
    isParam?: boolean;
    field: string;
    message: string;
  }) => {
    if (isParam) {
      return param(field).isMongoId().withMessage(message);
    }

    return body(field).isMongoId().withMessage(message);
  },
};

export const validate = {
  create: [
    helper
      .validateString({
        field: 'title',
        msgPrefix: 'Product title',
      })
      .isLength({ max: 100 })
      .withMessage('Product title cannot exceed 100 characters'),
    helper
      .validateString({
        field: 'tagline',
        msgPrefix: 'Product tagline',
      })
      .isLength({ max: 256 })
      .withMessage('Product tagline cannot exceed 256 characters'),
    helper
      .validateString({
        field: 'description',
        msgPrefix: 'Product description',
      })
      .isLength({ max: 1024 })
      .withMessage('Product description cannot exceed 1024 characters'),
    helper.validateString({
      field: 'brand',
      msgPrefix: 'Product brand',
    }),
    helper.validateString({
      field: 'model',
      msgPrefix: 'Product model',
    }),
    helper.validateString({
      field: 'category',
      msgPrefix: 'Product category',
    }),
    body('price').isInt().withMessage('Product price must be a number'),
    body('discount')
      .optional()
      .isInt()
      .withMessage('Product discount must be a number'),
    helper.validateString({
      field: 'seller ID',
      msgPrefix: 'Seller ID',
    }),
  ],

  update: [
    helper.validateIsMongoId({
      isParam: true,
      field: 'id',
      message: 'Provide a valid product ID',
    }),
  ],

  delete: [
    helper.validateIsMongoId({
      isParam: true,
      field: 'id',
      message: 'Provide a valid product ID',
    }),
  ],

  fetch: [
    helper.validateIsMongoId({
      isParam: true,
      field: 'id',
      message: 'Provide a valid product ID',
    }),
  ],
};
