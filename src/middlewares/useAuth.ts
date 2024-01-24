import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../configs/config';
import { Types } from 'mongoose';
import { useToken } from '../lib/useToken';
import { useResponse } from '../lib/useResponse';

export type AuthRequest = Request & {
  user: Types.ObjectId;
};

export const useAuth = () => {
  const auth = (
    { user, headers: { authorization } }: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    const { verify } = useToken();
    const { response } = useResponse(res);

    try {
      const token = authorization?.split(' ')[1];

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
      user = payload.id; // assign payload.id to req.user

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

  return { auth };
};
