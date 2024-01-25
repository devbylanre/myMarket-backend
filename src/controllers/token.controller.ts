import { Request, Response } from 'express';
import { Token } from '../models/token.model';
import { useResponse } from '../lib/useResponse';
import { User } from '../models/user.model';
import crypto from 'crypto';

export const controller = {
  confirm: async ({ body }: Request, res: Response) => {
    const { response } = useResponse(res);

    try {
      const { token } = body;

      // Find a matching token
      const doc = await Token.findOne({ token });
      if (!doc)
        throw new Error(
          'we were unable to find your token. Token may have expired'
        );

      // If we found token, find the user
      const user = await User.findById(doc.user);
      if (!user)
        throw new Error('We were unable to find a user with the token');

      // verify and save the user
      const verified = await User.findByIdAndUpdate(token.user, {
        isVerified: true,
      });

      return response({
        type: 'SUCCESS',
        code: 200,
        message: 'The account has been verified. Please log in again',
        data: verified?.isVerified,
      });
    } catch (error) {
      return response({
        type: 'ERROR',
        code: 500,
        message: (error as Error).message,
      });
    }
  },

  resend: async ({ body }: Request, res: Response) => {
    const { response } = useResponse(res);

    try {
      const { email } = body;
      const hash = crypto.randomBytes(128).toString('hex');

      const user = await User.findOne({ email });
      if (!user)
        throw new Error('We were unable to find a user with that email.');

      // Create a verification token
      const token = new Token({ user: user._id, token: hash });
      if (!token) throw new Error('Unable to create a token');

      return response({
        type: 'SUCCESS',
        code: 200,
        message: 'Token created successfully',
        data: token,
      });
    } catch (error) {
      return response({
        type: 'ERROR',
        code: 500,
        message: (error as Error).message,
      });
    }
  },
};
