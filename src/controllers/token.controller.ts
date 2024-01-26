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
        throw new Error('Unable to find your token. Token may have expired');

      // If we found token, find the user
      const user = await User.findById(doc.user);
      if (!user) throw new Error('Unable to find a user with the token');

      // Check if the user is not verified
      if (user.isVerified) throw new Error('Your account has been verified');

      // Verify and save the user
      const verifyUser = await User.findByIdAndUpdate(
        user._id,
        { isVerified: true },
        { new: true }
      );
      if (!verifyUser) throw new Error('Unable to verify the user');

      return response({
        type: 'SUCCESS',
        code: 200,
        message: 'The account has been verified. Please log in again',
        data: verifyUser.isVerified,
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
    const { email } = body;

    try {
      const hash = crypto.randomBytes(128).toString('hex');

      // Find user
      const user = await User.findOne({ email });
      if (!user) throw new Error('Unable to find a user with that email.');

      // If user was found, check if the user is verified
      if (user.isVerified) throw new Error('Your account has been verified');

      // Create a verification token
      const token = new Token({ user: user._id, token: hash });
      await token.save();
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
