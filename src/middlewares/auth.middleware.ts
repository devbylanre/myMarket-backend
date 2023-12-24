import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { Types } from 'mongoose';

export interface IAuthRequest extends Request {
  user?: Types.ObjectId;
}

export const auth = {
  user: (req: IAuthRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(403).json({
        status: 'error',
        message: 'User authorization token not provided',
        details: token,
      });
    }

    jwt.verify(token, config.secret_key, (err, decoded: any) => {
      if (err) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid user authorization token',
          details: token,
        });
      }

      // check if the token has expired
      if (decoded.exp * 1000 < Date.now()) {
        return res.status(401).json({
          status: 'error',
          message: 'User authorization token has expired',
          details: token,
        });
      }

      req.user = decoded;

      // continue to the next middleware function
      next();
    });
  },
};
