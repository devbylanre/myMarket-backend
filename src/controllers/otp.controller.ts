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
      // payload
      const { user, length, expiry } = body;

      const otp = generate(length); // one time password
      const expiresAt = Date.now() + expiry * 1000 * 60; // expire date

      /*
        send a mail to the user
        await mail({
        recipient: user.email,
        subject: 'One Time Password',
        file: 'otp.ejs',
        data: {
          name: user.name,
          otp: otp,
        },
        });
        */

      // create or update doc
      const doc = await OTP.findByIdAndUpdate(
        user.id,
        { reference: user.id, otp: otp, expiry: expiresAt },
        { upsert: true, new: true }
      );

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
      const { otp } = body; // payload
      const { reference } = params; // reference

      // otp document
      const doc = await OTP.findOne({ reference: reference });

      if (!doc) throw new Error('One Time Password not found');

      // check if is otp is valid
      const isValid = doc.otp === otp;
      if (!isValid) throw new Error('One Time Password is invalid');

      // check if otp has expired
      const hasExpired = Date.now() > doc.expiry;
      if (hasExpired) throw new Error('One Time Password has expired');

      // delete the document
      const deletedDoc = await OTP.findByIdAndDelete(reference);

      return response({
        type: 'SUCCESS',
        code: 200,
        message: 'One Time Password verification successful',
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
