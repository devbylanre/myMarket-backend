import mongoose from 'mongoose';
import { User } from '../models/user.model';
import { validationResult } from 'express-validator';
import { Request, Response, response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config';
import { notification } from './notification.controller';
import { mailer } from '../utils/nodemailer.util';
import path from 'path';

// firebase
import { initializeApp } from 'firebase/app';
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from 'firebase/storage';
import { handleResponse } from '../utils/res.util';

const firebaseApp = initializeApp(config.firebase);
const storage = getStorage(firebaseApp);

const helper = {
  hashPassword: (password: string) => {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  },

  comparePassword: (password: string, encrypted: string) => {
    return bcrypt.compareSync(password, encrypted);
  },

  generateNumbers: (length: number) => {
    let num = '';

    for (let i = 0; i < length; i++) {
      const random = Math.floor(Math.random() * 10);
      num += random.toString();
    }

    return num;
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
        return handleResponse.error({
          res: res,
          status: 401,
          message: errors.array(),
        });
      }

      // find user by email
      const emailExists = await User.findOne({
        email: data.email,
      });

      // check is user already exists
      if (emailExists) {
        return handleResponse.error({
          res: res,
          status: 403,
          message: 'Email is already registered to another account',
        });
      }

      // generate verification token
      const verificationToken = crypto.randomBytes(40).toString('hex');

      // create user
      const user = await User.create({
        ...data,
        password: helper.hashPassword(data.password as string),
        'verification.token': verificationToken,
      });

      await notification.create({
        recipient: user._id,
        content: 'Welcome to myMarket',
        type: 'sign-up',
      });

      // send an email to the user
      await mailer.send({
        to: data.email,
        subject: 'Welcome to myMarket',
        template: path.join(__dirname, '..', 'views', 'welcome.ejs'),
        data: {
          username: `${data.firstName} ${data.lastName}`,
          subject: 'Welcome to myMarket',
          verificationUrl: `http://localhost:3000/auth/verify/${verificationToken}`,
        },
      });

      return handleResponse.success({
        res: res,
        status: 201,
        message: 'User registration successful',
        data: null,
      });
    } catch (error: any) {
      return handleResponse.error({
        res: res,
        status: 500,
        message: error.message,
      });
    }
  },

  emailVerification: async function (req: Request, res: Response) {
    try {
      const { email, token } = req.body;

      const user = await User.findOne({ email: email });

      if (!user) {
        return handleResponse.error({
          res: res,
          status: 404,
          message: 'User does not exist',
        });
      }

      if (user.verification.token !== token) {
        return handleResponse.error({
          res: res,
          status: 401,
          message: 'Invalid verification token',
        });
      }

      await User.findByIdAndUpdate(user._id, {
        'verification.token': '',
        'verification.isVerified': true,
      });

      return handleResponse.success({
        res: res,
        status: 200,
        message: 'Email verification successful',
        data: null,
      });
    } catch (error: any) {
      return handleResponse.error({
        res: res,
        status: 500,
        message: error.message,
      });
    }
  },

  verification: async function (req: Request, res: Response) {
    try {
      const { email } = req.body;

      const errors = validationResult(req);

      // check if there's any validation error
      if (!errors.isEmpty()) {
        return handleResponse.error({
          res: res,
          status: 401,
          message: errors.array(),
        });
      }

      // find user by email
      const user = await User.findOne({ email: email });

      // check if user does not exist
      if (!user) {
        return handleResponse.error({
          res: res,
          status: 404,
          message: 'User does not exist',
        });
      }

      const { verification, otp, password, ...data } = user.toObject();

      return handleResponse.success({
        res: res,
        status: 200,
        message: 'User verification successful',
        data: { ...data },
      });
    } catch (error: any) {
      return handleResponse.error({
        res: res,
        status: 500,
        message: error.message,
      });
    }
  },

  authenticate: async function (req: Request, res: Response) {
    try {
      const auth = req.body;

      const errors = validationResult(req);

      // check if there's any validation error
      if (!errors.isEmpty()) {
        return handleResponse.error({
          res: res,
          status: 401,
          message: errors.array(),
        });
      }

      // find the user
      const user = await User.findOne({ email: auth.email });

      // check if user does not exist
      if (!user) {
        return handleResponse.error({
          res: res,
          status: 404,
          message: 'User does not exist',
        });
      }

      // check if user is verified
      if (!user.verification.isVerified) {
        return handleResponse.error({
          res: res,
          status: 403,
          message:
            'User is not verified, Check your email for verification link',
        });
      }

      // verify password
      const isPasswordMatch = helper.comparePassword(
        auth.password,
        user.password
      );

      // check if password does not match
      if (!isPasswordMatch) {
        return handleResponse.error({
          res: res,
          status: 401,
          message: 'Password does not match',
        });
      }

      const token = jwt.sign({ _id: user._id }, config.secret_key, {
        expiresIn: '24d',
      });
      const { exp } = jwt.decode(token) as Record<string, any>;

      const { password, otp, verification, ...data } = user.toObject();

      return handleResponse.success({
        res: res,
        status: 200,
        message: 'User authentication successful',
        data: { ...data, token: { id: token, exp: exp } },
      });
    } catch (error: any) {
      return handleResponse.error({
        res: res,
        status: 500,
        message: error.message,
      });
    }
  },

  update: async function (req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;

      if (!data || Object.keys(data).length < 1) {
        return handleResponse.error({
          res: res,
          status: 400,
          message: 'No data to update',
        });
      }

      // find user by id
      const userExists = await User.findById(id as any);

      // check if user does not exists
      if (!userExists) {
        return handleResponse.error({
          res: res,
          status: 404,
          message: 'Cannot update user that does not exist',
        });
      }

      // update user data
      await User.findByIdAndUpdate(id, data);

      return handleResponse.success({
        res: res,
        status: 200,
        message: 'User data updated successfully',
        data: { ...data },
      });
    } catch (error: any) {
      return handleResponse.error({
        res: res,
        status: 500,
        message: 'Unable to update user data',
      });
    }
  },

  fetch: async function (req: Request, res: Response) {
    try {
      const { id } = req.params;

      const errors = validationResult(req);

      // check if there's any validation error
      if (!errors.isEmpty()) {
        return handleResponse.error({
          res: res,
          status: 401,
          message: errors.array(),
        });
      }

      // find user by id
      const user = await User.findById(id);

      // check if user does not exist
      if (!user) {
        return handleResponse.error({
          res: res,
          status: 404,
          message: 'User not found',
        });
      }

      const { password, verification, otp, ...data } = user.toObject();

      return handleResponse.success({
        res: res,
        status: 200,
        message: 'User data fetched successfully',
        data: { ...data },
      });
    } catch (error: any) {
      return handleResponse.error({
        res: res,
        status: 500,
        message: error.message,
      });
    }
  },

  createOTP: async function (req: Request, res: Response) {
    try {
      const { id } = req.params;

      const errors = validationResult(req);

      // check if there's any validation error
      if (!errors.isEmpty()) {
        return handleResponse.error({
          res: res,
          status: 401,
          message: errors.array(),
        });
      }

      // find user by id
      const user = await User.findById(id);

      // check if user does not exist
      if (!user) {
        return handleResponse.error({
          res: res,
          status: 404,
          message: 'User does not exist',
        });
      }

      // generate token
      const code = helper.generateNumbers(6);
      const expiresAt = new Date().setTime(new Date().getTime() + 900000); // 15 minutes

      // update user data
      await User.findByIdAndUpdate(id, {
        'otp.code': code,
        'otp.expiresAt': expiresAt,
      });

      return handleResponse.success({
        res: res,
        status: 200,
        message: 'OTP generated successfully',
        data: { otp: { code, expiresAt } },
      });
    } catch (error: any) {
      return handleResponse.error({
        res: res,
        status: 500,
        message: error.message,
      });
    }
  },

  verifyOTP: async function (req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { code } = req.body;

      const errors = validationResult(req);

      // check if there's any validation error
      if (!errors.isEmpty()) {
        return handleResponse.error({
          res: res,
          status: 401,
          message: errors.array(),
        });
      }

      // find user
      const user = await User.findById(id);

      // check if user exists
      if (!user) {
        return handleResponse.error({
          res: res,
          status: 404,
          message: 'User does not exist',
        });
      }

      // check if token exist
      if (!user.otp.code) {
        return handleResponse.error({
          res: res,
          status: 401,
          message: 'No One Time Password was found',
        });
      }

      // check if the user token key matches the provided key
      if (user.otp.code !== code) {
        return handleResponse.error({
          res: res,
          status: 400,
          message: 'Invalid One Time Password',
        });
      }

      let result;

      // check if current time is greater than the token expiration time
      if (user.otp.expiresAt < Date.now()) {
        result = await User.findByIdAndUpdate(id, {
          'otp.key': '',
          'otp.expiration': 0,
        });
        return handleResponse.error({
          res: res,
          status: 400,
          message: 'One Time Password has expired',
        });
      }

      result = await User.findByIdAndUpdate(id, {
        'otp.code': '',
        'otp.expiresAt': 0,
      });

      return handleResponse.success({
        res: res,
        status: 200,
        message: 'One Time Password has been verified',
        data: null,
      });
    } catch (error: any) {
      return handleResponse.error({
        res: res,
        status: 500,
        message: error.message,
      });
    }
  },

  changePassword: async function (req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return handleResponse.error({
          res: res,
          status: 401,
          message: errors.array(),
        });
      }

      const user = await User.findOne({ email: email });

      if (!user) {
        return handleResponse.error({
          res: res,
          status: 404,
          message: 'User does not exist',
        });
      }

      const isMatch = helper.comparePassword(password.old, user.password);

      if (!isMatch) {
        return handleResponse.error({
          res: res,
          status: 401,
          message: 'Your previous password is incorrect',
        });
      }

      await User.findByIdAndUpdate(user._id, {
        password: helper.hashPassword(password.new),
      });

      return handleResponse.success({
        res: res,
        status: 200,
        message: 'Password updated successfully',
        data: null,
      });
    } catch (error: any) {
      return handleResponse.error({
        res: res,
        status: 500,
        message: error.message,
      });
    }
  },

  changeEmail: async function (req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const { id } = req.params;

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return handleResponse.error({
          res: res,
          status: 401,
          message: errors.array(),
        });
      }

      const user = await User.findById(id);

      if (!user) {
        return handleResponse.error({
          res: res,
          status: 404,
          message: 'User does not exist',
        });
      }

      const isMatch = helper.comparePassword(password, user.password);

      if (!isMatch) {
        return handleResponse.error({
          res: res,
          status: 401,
          message: 'Incorrect password',
        });
      }

      await User.findByIdAndUpdate(user._id, { email: email });

      return handleResponse.success({
        res: res,
        status: 200,
        message: 'Email changed successfully',
        data: { email: email },
      });
    } catch (error: any) {
      return handleResponse.error({
        res: res,
        status: 500,
        message: error.message,
      });
    }
  },

  uploadPhoto: async (req: Request, res: Response) => {
    try {
      const file = req.file;
      const { id } = req.params;

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        if (!errors.isEmpty()) {
          return handleResponse.error({
            res: res,
            status: 401,
            message: errors.array(),
          });
        }
      }

      if (!file) {
        return handleResponse.error({
          res: res,
          status: 400,
          message: 'No file specified',
        });
      }

      const user = await User.findById(id);

      if (!user) {
        return handleResponse.error({
          res: res,
          status: 404,
          message: 'User does not exist',
        });
      }

      const encrypted =
        user._id + '-' + Date.now() + path.extname(file.originalname);
      const storageRef = ref(storage, `photos/${encrypted}`);

      if (user.photo.name) {
        const deleteRef = ref(storage, `/photos/${user.photo.name}`);
        await deleteObject(deleteRef);
      }

      const snapshot = await uploadBytes(storageRef, file.buffer);
      const url = await getDownloadURL(snapshot.ref);

      const update = await User.findByIdAndUpdate(
        user._id,
        { photo: { url: url, name: encrypted } },
        { new: true }
      );

      return handleResponse.success({
        res: res,
        status: 200,
        message: 'Photo uploaded successfully',
        data: { name: encrypted, url: url },
      });
    } catch (error: any) {
      return handleResponse.error({
        res: res,
        status: 500,
        message: error.message,
      });
    }
  },

  fetchProducts: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const products = await User.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(id) } },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: 'sellerId',
            as: 'products',
          },
        },
      ]);

      if (!products || products.length === 0) {
        return handleResponse.error({
          res: res,
          status: 404,
          message: 'No products was found',
        });
      }

      return handleResponse.success({
        res: res,
        status: 200,
        message: 'Products found',
        data: products[0].products,
      });
    } catch (error: any) {
      return handleResponse.error({
        res: res,
        status: 500,
        message: error.message,
      });
    }
  },
};
