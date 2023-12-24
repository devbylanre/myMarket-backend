import { body, param } from 'express-validator';

interface IValidateField {
  field: string;
  maxLength: number;
  msgPrefix: string;
}

const helper = {
  validateField: ({ field, maxLength, msgPrefix }: IValidateField) => {
    return body(field)
      .trim()
      .not()
      .isEmpty()
      .withMessage(`${msgPrefix} is required`)
      .isString()
      .withMessage(`${msgPrefix} must be a string`)
      .isLength({ max: maxLength })
      .withMessage(`${msgPrefix} cannot extend ${maxLength} characters`);
  },

  validateString: ({
    field,
    msgPrefix,
  }: {
    field: string;
    msgPrefix: string;
  }) => {
    return body(field)
      .trim()
      .not()
      .isEmpty()
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
    helper.validateField({
      field: 'title',
      maxLength: 100,
      msgPrefix: 'Product title',
    }),
    helper.validateField({
      field: 'tagline',
      maxLength: 256,
      msgPrefix: 'Product tagline',
    }),
    helper.validateField({
      field: 'description',
      maxLength: 1024,
      msgPrefix: 'Product description',
    }),
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
    body('tags.*')
      .trim()
      .not()
      .isEmpty()
      .withMessage('Include at least one product tag'),
    body('price').isInt().withMessage('Product price must be a number'),
    body('discount')
      .optional()
      .isInt()
      .withMessage('Product discount must be a number'),
    body('sellerId').isMongoId().withMessage('Invalid user ID'),
  ],

  update: [
    helper.validateIsMongoId({
      field: 'id',
      message: 'Provide a valid product ID',
    }),
  ],

  delete: [
    helper.validateIsMongoId({
      field: 'id',
      message: 'Provide a valid product ID',
    }),
  ],
};
