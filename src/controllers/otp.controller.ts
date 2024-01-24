import { Request, Response } from 'express';
import { OTP } from '../models/otp.model';
import { useResponse } from '../lib/useResponse';
import { useMailer } from '../lib/useMailer';
import { useOTP } from '../lib/useOTP';
import { send } from 'process';

export const controller = {
  create: async ({ body }: Request, res: Response) => {
    const { response } = useResponse(res);
    const { generate } = useOTP();
    const { mail } = useMailer();

    try {
      const { user, length, sender, expiry } = body;

      const otp = generate(length);
      const expiresAt = Date.now() + expiry * 1000;

      await mail({
        recipient: user.email,
        subject: 'One Time Password',
        file: 'otp.ejs',
        data: {
          name: user.name,
          otp: otp,
        },
      });

      const doc = await OTP.findByIdAndUpdate(sender, {
        otp: otp,
        expiry: expiresAt,
        reference: sender,
      });

      return response({
        type: 'SUCCESS',
        code: 201,
        message: 'One time password generated successfully',
        data: doc,
      });
    } catch (error) {
      return response({
        type: 'ERROR',
        code: 500,
        message: (error as Error).message,
      });
    }
  },

  validate: async ({ body, params }: Request, res: Response) => {
    const { response } = useResponse(res);

    try {
      const { otp } = body;
      const { reference } = params;

      const doc = await OTP.findOne({ reference: reference });

      if (!doc) throw new Error('One Time Password not found');

      const hasExpired = Date.now() > doc.expiry;
      if (hasExpired) throw new Error('One Time Password has expired');

      const isOk = doc.otp === otp;
      if (!isOk) throw new Error('Invalid One Time Password');

      const deletedDoc = await OTP.findByIdAndDelete(reference);

      return response({
        type: 'SUCCESS',
        code: 200,
        message: 'One Time Password verification successfully',
        data: deletedDoc,
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
