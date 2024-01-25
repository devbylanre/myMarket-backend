import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { useToken } from '../lib/useToken';
import { useResponse } from '../lib/useResponse';

export const useAuthorization = () => {
  const authorize = (req: Request, res: Response, next: NextFunction) => {
    const { verify } = useToken();
    const { response } = useResponse(res);

    try {
      const { headers } = req;
      const token = headers.authorization?.split(' ')[1];

      // check if token is empty
      if (!token) {
        return response({
          type: 'ERROR',
          code: 400,
          message: 'Authorization token is required',
        });
      }

      // verify token
      const payload = verify(token);
      req.body.userId = payload.id; // assign payload.id to req.user

      // go to the next function
      next();
    } catch (error) {
      return response({
        type: 'ERROR',
        code: 500,
        message: (error as Error).message,
      });
    }
  };

  return { authorize };
};
