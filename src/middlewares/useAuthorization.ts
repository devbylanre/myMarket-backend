import { Request, Response, NextFunction } from 'express';
import config from '../configs/config';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { useResponse } from '../lib/useResponse';

export const useAuthorization = () => {
  const authorize = (
    { headers, body }: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { response } = useResponse(res);

    try {
      const authorization = headers.authorization;
      const token = authorization ? authorization.split(' ')[1] : null;

      // Check if token was not found
      if (!token) {
        return response({
          type: 'ERROR',
          code: 403,
          message: 'Authorization token is required',
        });
      }

      // Verify token
      jwt.verify(token, config.accessToken, (error, data) => {
        if (error) {
          return response({
            type: 'ERROR',
            code: 401,
            message: 'Invalid authorization token',
          });
        }

        // If no error occurred
        body.userId = (data as JwtPayload).userId;

        // Go to the next function
        next();
      });
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
