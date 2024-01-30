import {
  Location,
  ValidationChain,
  body,
  param,
  validationResult,
} from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const useValidate = () => {
  const handleValidationErrors = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const errors = validationResult(req);
    const isEmpty = errors.isEmpty();

    // check if route has no error
    if (!isEmpty) {
      const array = errors.array(); // array containing all errors
      const error = array.find((_, i) => i === 0); // first error

      return res.status(400).json({
        status: 'error',
        code: 401,
        message: error?.msg,
      });
    }

    // go to the next function
    next();
  };

  const validate = (validations: ValidationChain[]) => {
    return [...validations, handleValidationErrors];
  };

  const isString = (field: string, label: string) => {
    return body(field, `${label} must be a valid string`).notEmpty().isString();
  };

  const isEmail = (field: string, label: string) => {
    return body(field, `${label} must be a valid email address`).isEmail();
  };

  const isNumber = (field: string, label: string) => {
    return body(field, `${label} must be a valid number`).isNumeric();
  };

  const isStrongPassword = (field: string, label: string) => {
    return body(
      field,
      `${label} must be 8 characters long and contain one uppercase, lowercase, and special character`
    )
      .notEmpty()
      .isStrongPassword();
  };

  const isMongoId = (
    location: 'body' | 'param',
    field: string,
    label: string
  ) => {
    const message = `Invalid ${label} ID`;

    if (location === 'body') {
      return body(field, message);
    }

    return param(field, message);
  };

  return { validate, isString, isNumber, isEmail, isMongoId, isStrongPassword };
};
