import { body, param, ValidationChain } from 'express-validator';

export class ValidationUtil {
  isNotEmpty(fieldName: string, msg: string) {
    const result = body(fieldName).trim().not().isEmpty().withMessage(msg);
    return result;
  }

  isLength(fn: ValidationChain, length: Record<string, any>, msg: string) {
    const result = fn.isLength(length).withMessage(msg);

    return result;
  }

  isString(fn: ValidationChain, msg: string) {
    const result = fn.isString().withMessage(msg);

    return result;
  }

  isEmail(fn: ValidationChain, msg: string) {
    return fn.isEmail().withMessage(msg);
  }

  isUrl(fn: ValidationChain, msg: string) {
    return fn.isURL().withMessage(msg);
  }

  isNumber(fieldName: string, msg: string) {
    return body(fieldName).notEmpty().withMessage(msg);
  }

  isNumberLength(
    fn: ValidationChain,
    length: Record<string, any>,
    msg: string
  ) {
    return fn.isInt(length).withMessage(msg);
  }

  isObjectID(fieldName: string, msg: string) {
    return body(fieldName).isMongoId().withMessage(msg);
  }

  isParamObjectID(fieldName: string, msg: string) {
    return param(fieldName).isMongoId().withMessage(msg);
  }

  isBoolean(fieldName: string, msg: string) {
    return body(fieldName).isBoolean().withMessage(msg);
  }

  isStrongPassword(fn: ValidationChain, msg: string) {
    return fn.isStrongPassword().withMessage(msg);
  }

  isURL(fn: ValidationChain, msg: string) {
    return fn.isURL().withMessage(msg);
  }

  isArray(fieldName: string, msg: string) {
    return body(fieldName).isArray().withMessage(msg);
  }
}
