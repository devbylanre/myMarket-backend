import mongoose, { Types } from 'mongoose';
import { User } from '../models/user.model';
import { validationResult } from 'express-validator';
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config';
import { NotificationController } from './notification.controller';
import { mailer } from '../utils/nodemailer.util';
import path from 'path';

const notification = new NotificationController();

interface PasswordUpdateType<T = 'update' | 'reset'> {
  type: T;
}

type PasswordUpdateSchema =
  | (PasswordUpdateType<'update'> & {
      password: {
        old: string;
        new: string;
      };
    })
  | (PasswordUpdateType<'reset'> & { password: string });

interface ErrorResponse {
  code: number;
  message: string;
  details: any;
}

interface SuccessResponse<T> {
  data: T;
  message: any;
}

interface ResponseState<S = 'error' | 'success'> {
  state: S;
}

type ApiResponse<T> =
  | (ResponseState<'success'> & SuccessResponse<T>)
  | (ResponseState<'error'> & { error: ErrorResponse });

const util = {
  errorResponse: function <T>(
    code: number,
    message: string,
    details: any
  ): ApiResponse<null> {
    return {
      state: 'error',
      error: {
        code: code,
        message: message,
        details: details,
      },
    };
  },

  successResponse: function <T>(data: T, message: string): ApiResponse<T> {
    return {
      state: 'success',
      data: data,
      message: message,
    };
  },

  createToken: function (id: mongoose.Types.ObjectId) {
    return jwt.sign({ _id: id }, config.secret_key, { expiresIn: '24d' });
  },

  decodeToken: function (token: string) {
    return jwt.decode(token);
  },

  hashPassword: function (password: string) {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  },

  comparePassword: function (password: string, encrypted: string) {
    return bcrypt.compareSync(password, encrypted);
  },

  generateNumbers: function (length: number) {
    let num = '';

    for (let i = 0; i < length; i++) {
      const random = Math.floor(Math.random() * 10);
      num += random.toString();
    }

    return num;
  },

  generateHexString: function (length: number) {
    return crypto.randomBytes(length).toString('hex');
  },
};

//  controller

export const controller = {
  create: async (req: Request, res: Response) => {
    try {
      const data = req.body;
      const errors = validationResult(req);

      // check if there's any validation error
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json(
            util.errorResponse(400, 'Request validation error', errors.array())
          );
      }

      // find user by email
      const emailExists = await User.findOne({
        email: data.email,
      });

      // check is user already exists
      if (emailExists) {
        return res
          .status(400)
          .json(
            util.errorResponse(
              400,
              'Email is already registered to another user',
              data.email
            )
          );
      }

      // generate verification token
      const verificationToken = util.generateHexString(40);

      // create user
      const user = await User.create({
        ...data,
        password: util.hashPassword(data.password as string),
        'verification.token': verificationToken,
      });

      await notification.createNotification({
        userId: user._id,
        message: 'Welcome to myMarket',
        activityType: 'registration',
      });

      // send an email to the user
      const mail = await mailer.send({
        to: data.email,
        subject: 'Welcome to myMarket',
        template: path.join(__dirname, '..', 'views', 'welcome.ejs'),
        data: {
          username: `${data.firstName} ${data.lastName}`,
          subject: 'Welcome to myMarket',
          verificationUrl: `http://localhost:3000/auth/verify/${verificationToken}`,
        },
      });

      return res
        .status(200)
        .json(
          util.successResponse(
            { user: user.email, mail: mail?.messageId },
            'User registration successfully'
          )
        );
    } catch (err: any) {
      return res
        .status(500)
        .json(
          util.errorResponse(
            500,
            'Unable to complete user registration',
            err.message
          )
        );
    }
  },

  verify: async function (req: Request, res: Response) {
    try {
      const { token } = req.params;

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res
          .status(401)
          .json(util.errorResponse(401, 'Request validation error', token));
      }

      const user = await User.findOneAndUpdate(
        { 'verification.token': token },
        {
          'verification.token': '',
          'verification.isVerified': true,
        }
      );

      if (!user) {
        return res
          .status(400)
          .json(util.errorResponse(400, 'Invalid verification token', token));
      }

      return res
        .status(200)
        .json(util.successResponse(token, 'User verification successful'));
    } catch (error: any) {
      return res
        .status(500)
        .json(
          util.errorResponse(500, 'Invalid verification token', error.message)
        );
    }
  },

  authenticate: async function (req: Request, res: Response) {
    try {
      const auth = req.body;

      const errors = validationResult(req);

      // check if there's any validation error
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json(
            util.errorResponse(400, 'Request validation error', errors.array())
          );
      }

      // find the user
      const user = await User.findOne({ email: auth.email });

      // check if user does not exist
      if (!user) {
        return res
          .status(400)
          .json(util.errorResponse(400, 'User does not exist', auth.email));
      }

      // check if user is verified
      if (!user.verification.isVerified) {
        return res
          .status(401)
          .json(
            util.errorResponse(
              401,
              'User is not verified, Check your email for verification link',
              user.verification.isVerified
            )
          );
      }

      // verify password
      const isPasswordMatch = util.comparePassword(
        auth.password,
        user.password
      );

      // check if password does not match
      if (!isPasswordMatch) {
        return res
          .status(400)
          .json(
            util.errorResponse(400, 'Password does not match', auth.password)
          );
      }

      const token = util.createToken(user._id); // create a jwt token
      const { exp } = util.decodeToken(token) as Record<string, any>;

      const { password, otp, verification, ...data } = user.toObject();

      return res.status(200).json(
        util.successResponse(
          {
            ...data,
            token: { id: token, exp },
          },
          'User authentication successful'
        )
      );
    } catch (err: any) {
      return res
        .status(500)
        .json(
          util.errorResponse(500, 'Unable to authenticate user', err.message)
        );
    }
  },

  update: async function (req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;

      if (!data || Object.keys(data).length < 1) {
        return res
          .status(400)
          .json(
            util.errorResponse(400, 'No data provided', 'Invalid data provided')
          );
      }

      const errors = validationResult(req);

      // check if there's any validation error
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json(
            util.errorResponse(400, 'Request validation error', errors.array())
          );
      }

      // find user by id
      const userExists = await User.findById(id as any);

      // check if user does not exists
      if (!userExists) {
        return res
          .status(422)
          .json(
            util.errorResponse(
              422,
              'Cannot update a user that does not exist',
              id
            )
          );
      }

      // update user data
      await User.findByIdAndUpdate(id, data);

      return res
        .status(200)
        .json(util.successResponse(data, 'User updated successfully'));
    } catch (err: any) {
      return res
        .status(500)
        .json(
          util.errorResponse(500, 'Unable to update user data', err.message)
        );
    }
  },

  fetch: async function (req: Request, res: Response) {
    try {
      const { id } = req.params;

      const errors = validationResult(req);

      // check if there's any validation error
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json(
            util.errorResponse(400, 'Request validation error', errors.array())
          );
      }

      // find user by id
      const user = await User.findById(id);

      // check if user does not exist
      if (!user) {
        return res
          .status(404)
          .json(util.errorResponse(500, 'User not found', id));
      }

      const { password, verification, otp, ...data } = user.toObject();

      return res
        .status(200)
        .json(util.successResponse(data, 'User data fetched successfully'));
    } catch (err: any) {
      return res
        .status(500)
        .json(
          util.errorResponse(500, 'Unable to fetch user data', err.message)
        );
    }
  },

  createOTP: async function (req: Request, res: Response) {
    try {
      const { id } = req.params;

      const errors = validationResult(req);

      // check if there's any validation error
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json(
            util.errorResponse(400, 'Request validation error', errors.array())
          );
      }

      // find user by id
      const user = await User.findById(id);

      // check if user does not exist
      if (!user) {
        return res
          .status(404)
          .json(util.errorResponse(404, 'User not found', id));
      }

      // generate token
      const code = util.generateNumbers(6);
      const expiresAt = new Date().setTime(new Date().getTime() + 900000); // 15 minutes

      // update user data
      await User.findByIdAndUpdate(id, {
        'otp.code': code,
        'otp.expiresAt': expiresAt,
      });

      return res
        .status(200)
        .json(
          util.successResponse(
            { otp: { code, expiresAt } },
            'OTP code generated successfully'
          )
        );
    } catch (err: any) {
      return res
        .status(500)
        .json(util.errorResponse(500, 'Unable to generate toke', err.message));
    }
  },

  verifyOTP: async function (req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { code } = req.body;

      const errors = validationResult(req);

      // check if there's any validation error
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json(
            util.errorResponse(400, 'Request validation error', errors.array())
          );
      }

      // find user
      const user = await User.findById(id);

      // check if user exists
      if (!user) {
        return res
          .status(404)
          .json(util.errorResponse(404, 'User not found', id));
      }

      // check if token exist
      if (!user.otp.code) {
        return res
          .status(400)
          .json(util.errorResponse(400, 'No OTP code was found', id));
      }

      // check if the user token key matches the provided key
      if (user.otp.code !== code) {
        return res
          .status(401)
          .json(util.errorResponse(400, 'Invalid OTP code', code));
      }

      let result;

      // check if current time is greater than the token expiration time
      if (user.otp.expiresAt < Date.now()) {
        result = await User.findByIdAndUpdate(id, {
          'otp.key': '',
          'otp.expiration': 0,
        });
        return res
          .status(401)
          .json(
            util.errorResponse(400, 'One time password code has expired', id)
          );
      }

      result = await User.findByIdAndUpdate(id, {
        'otp.code': '',
        'otp.expiresAt': 0,
      });

      return res
        .status(200)
        .json(
          util.successResponse(
            result?.otp,
            'One time password verification successful'
          )
        );
    } catch (err: any) {
      res
        .status(500)
        .json(util.errorResponse(500, 'Unable to verify token', err.message));
    }
  },

  verifyEmail: async function (req: Request, res: Response) {
    try {
      const { email } = req.body;

      const errors = validationResult(req);

      // check if there's any validation error
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json(
            util.errorResponse(400, 'Request validation error', errors.array())
          );
      }

      // find user by email
      const user = await User.findOne({ email: email });

      // check if user does not exist
      if (!user) {
        return res
          .status(404)
          .json(util.errorResponse(404, 'User not found', email));
      }

      const { verification, otp, password, ...data } = user.toObject();

      return res
        .status(200)
        .json(util.successResponse(data, 'User verification successful'));
    } catch (err: any) {
      return res
        .status(500)
        .json(util.errorResponse(err, 'User verification failed', err.message));
    }
  },

  updatePassword: async function (req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { type, password }: PasswordUpdateSchema = req.body;

      const user = await User.findById(id);

      if (!user) {
        return res
          .status(404)
          .json(util.errorResponse(404, 'User not found', id));
      }

      if (type === 'reset') {
        await User.findByIdAndUpdate(user?._id, {
          password: util.hashPassword(password),
        });

        return res
          .status(200)
          .json(util.successResponse(password, 'Password reset successfully'));
      } else if (type === 'update') {
        const passwordMatch = util.comparePassword(
          password.old,
          user?.password!
        );

        if (passwordMatch) {
          await User.findOneAndUpdate(user?._id, {
            password: util.hashPassword(password.new),
          });
        } else {
          return res
            .status(401)
            .json(
              util.errorResponse(
                401,
                'Your previous or old password was incorrect',
                password.old
              )
            );
        }
      }

      return res
        .status(400)
        .json(
          util.errorResponse(
            400,
            'Specify the type of update',
            type || 'No type specified'
          )
        );
    } catch (error: any) {
      return res
        .status(500)
        .json(
          util.errorResponse(500, 'Unable to update password', error.message)
        );
    }
  },
};
