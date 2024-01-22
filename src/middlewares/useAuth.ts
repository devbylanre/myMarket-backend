import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { config } from '../config';
import { Types } from 'mongoose';

type Auth = Request & {
  user: Types.ObjectId;
};

export const useAuth = () => {
  const auth = (req: Auth, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return;
    }

    const verify = () => {
      const check = jwt.verify(token, config.secretKey, (error, data) => {
        if (error) {
        }

        const hasExpired = Date.now() > (data as JwtPayload).exp! * 1000;
        if (hasExpired) {
        }

        req.user = (data as JwtPayload).id;
      });
      return;
    };

    verify();
    next();
  };

  return { auth };
};
