import { validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const useValidate = () => {
  const validate = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    const isEmpty = errors.isEmpty();

    if (!isEmpty) {
      const array = errors.array();

      const error = array.find((data, i) => {
        return i === 0 ? data.msg : 'No validation error was provided';
      });

      return res.status(400).json({
        code: 401,
        message: error,
      });
    }

    next();
  };
};
