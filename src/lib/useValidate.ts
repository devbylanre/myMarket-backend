import { validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const useValidate = () => {
  const validate = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    const isEmpty = errors.isEmpty();

    // check if route has no error
    if (!isEmpty) {
      const array = errors.array(); // array containing all errors
      const error = array.find((_, i) => i === 0); // first error

      return res.status(400).json({
        code: 401,
        message: error?.msg,
      });
    }

    // go to the next function
    next();
  };

  return { validate };
};
