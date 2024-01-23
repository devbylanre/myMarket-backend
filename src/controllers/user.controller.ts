import { Types } from 'mongoose';
import { User } from '../models/user.model';
import { Request, Response } from 'express';
import crypto from 'crypto';
import config from '../config';
import { createNotification } from './notification.controller';
import { useMailer } from '../lib/useMailer';
import path from 'path';
import { initializeApp } from 'firebase/app';
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from 'firebase/storage';
import { useResponse } from '../lib/useResponse';
import { usePassword } from '../lib/usePassword';
import { useToken } from '../lib/useToken';
import { Product } from '../models/product.model';

const firebaseApp = initializeApp(config.firebase);
const storage = getStorage(firebaseApp);

export const controller = {
  create: async ({ body }: Request, res: Response) => {
    const { mail } = useMailer();
    const { encrypt } = usePassword();
    const { response } = useResponse(res);

    try {
      const { firstName, lastName, email, password } = body;
      const name = `${firstName} ${lastName}`;
      const token = crypto.randomBytes(40).toString('hex');
      const encryptedPassword = encrypt(password);

      // find user with email
      const existingUser = await User.findOne({ email: body.email });

      if (existingUser) {
        throw new Error('Email is already registered to another user');
      }

      // register user
      const registeredUser = await User.create({
        ...body,
        password: encryptedPassword,
        'verification.token': token,
      });

      // notify user about successful registration
      const notification = await createNotification({
        type: 'SIGN_UP',
        recipient: registeredUser._id,
        message: `Welcome aboard, ${name}! 🚀 Let's get you started with your personalized journey on MyMarket`,
      });

      // send an e-mail to the user about successful registration
      const eMail = await mail({
        recipient: email,
        subject: 'Welcome to myMarket',
        file: 'welcome.ejs',
        data: {
          name: name,
          subject: 'Welcome to MyMarket',
          url: `${config.client}/verify?type=email&email=${body.email}&token=${token}`,
        },
      });

      return response({
        type: 'SUCCESS',
        code: 201,
        message: 'Account created successfully',
        data: { email, notification, eMail },
      });
    } catch (error) {
      return response({
        type: 'ERROR',
        code: 500,
        message: (error as Error).message,
      });
    }
  },

  authenticate: async ({ body }: Request, res: Response) => {
    const { isMatch } = usePassword();
    const { sign, expire } = useToken();
    const { response } = useResponse(res);

    try {
      const user = await User.findOne({ email: body.email });
      if (!user) throw new Error('We could not find your account');

      const passwordMatch = isMatch(body.password, user.password);
      if (!passwordMatch) throw new Error('Invalid password, try again');

      const token = sign({ id: user._id }, '24d');
      const expiresAt = expire(token);

      const { otp, verification, password, ...data } = user.toObject();

      return response({
        type: 'SUCCESS',
        code: 200,
        message: 'User authentication successful',
        data: { data, session: { token, expiresAt } },
      });
    } catch (error) {
      return response({
        type: 'ERROR',
        code: 500,
        message: (error as Error).message,
      });
    }
  },

  get: async ({ params: { id } }: Request, res: Response) => {
    const { response } = useResponse(res);
    try {
      const user = await User.findById(id);
      if (!user) throw new Error('User account not found');

      const { otp, verification, password, ...data } = user.toObject();

      return response({
        type: 'SUCCESS',
        code: 200,
        message: 'User verification successful',
        data: { ...data },
      });
    } catch (error) {
      return response({
        type: 'ERROR',
        code: 500,
        message: (error as Error).message,
      });
    }
  },

  update: async ({ params: { id }, body }: Request, res: Response) => {
    const { response } = useResponse(res);

    try {
      const { otp, verification, password, email, ...payload } = body;

      const user = await User.findById(id);
      if (!user) throw new Error('User account not found');

      const storeAlreadyExists = payload?.store?.name === user?.store?.name;

      if (storeAlreadyExists)
        throw new Error('Store name has already been taken ');

      const updatedUser = await User.findByIdAndUpdate(id, { ...payload });

      return response({
        type: 'SUCCESS',
        code: 200,
        message: 'User updated successfully',
        data: payload,
      });
    } catch (error) {
      return response({
        type: 'ERROR',
        code: 500,
        message: (error as Error).message,
      });
    }
  },

  emailVerification: async ({ body }: Request, res: Response) => {
    const { response } = useResponse(res);

    try {
      const { email, verification } = body;
      const user = await User.findOne({ email: email });
      if (!user) throw new Error('User account not found');

      const isUserVerified = user.verification?.isVerified;
      if (isUserVerified) throw new Error('This email is already verified');

      const isTokenValid = verification.token === user.verification?.token;
      if (!isTokenValid) throw new Error('Verification token is not valid');

      const verifyUser = await User.findOneAndUpdate(
        { email: email },
        { 'verification.token': '', 'verification.isVerified': true }
      );

      return response({
        type: 'SUCCESS',
        code: 200,
        message: 'User email verification successfully',
        data: 'Email verification completed successfully',
      });
    } catch (error) {
      return response({
        type: 'ERROR',
        code: 500,
        message: (error as Error).message,
      });
    }
  },

  uploadPhoto: async ({ file, params: { id } }: Request, res: Response) => {
    const { response } = useResponse(res);

    try {
      // check if no file was uploaded
      if (!file) throw new Error('No file was provided');

      // find user account
      const user = await User.findById(id);
      if (!user) throw new Error('User account not found');

      // get file extension
      const fileExtension = path.extname(file.originalname);
      // create unique file name
      const fileName = `${Date.now()}-${user._id}${fileExtension}`;

      // check if file exists
      if (user.photo?.name) {
        const photo = ref(storage, `photos/${user.photo?.name}`);
        await deleteObject(photo);
      }

      const photo = ref(storage, `photos/${fileName}`);
      // upload file
      const uploadedPhoto = await uploadBytes(photo, file.buffer);
      // get uploaded file url
      const uploadedFileURI = getDownloadURL(uploadedPhoto.ref);

      // store file data
      const savedPhoto = await User.findByIdAndUpdate(
        id,
        { 'photo.name': fileName, 'photo.url': uploadedFileURI },
        { new: true }
      );

      return response({
        type: 'SUCCESS',
        code: 200,
        message: 'User updated successfully',
        data: savedPhoto?.photo,
      });
    } catch (error) {
      return response({
        type: 'ERROR',
        code: 500,
        message: (error as Error).message,
      });
    }
  },

  changeEmail: async ({ body }: Request, res: Response) => {
    const { response } = useResponse(res);
    const { isMatch } = usePassword();
    const { oldEmail, newEmail, password } = body;

    try {
      const user = await User.findOne({ email: oldEmail });
      if (!user) throw new Error('User account not registered');

      const isPasswordValid = isMatch(password, user.password);
      if (!isPasswordValid) throw new Error('Incorrect password, try again');

      const updatedUser = await User.findOneAndUpdate(
        { email: oldEmail },
        { email: newEmail },
        { new: true }
      );

      return response({
        type: 'SUCCESS',
        code: 200,
        message: 'Email updated successfully',
        data: updatedUser?.email,
      });
    } catch (error) {
      return response({
        type: 'ERROR',
        code: 500,
        message: (error as Error).message,
      });
    }
  },

  changePassword: async ({ body }: Request, res: Response) => {
    const { response } = useResponse(res);
    const { isMatch, encrypt } = usePassword();

    try {
      const { email, oldPassword, newPassword } = body;

      const user = await User.findOne({ email: email });
      if (!user) throw new Error(`User account not found`);

      const isPasswordValid = isMatch(oldPassword, user.password);
      if (!isPasswordValid) throw new Error('Incorrect password, try again');

      const encryptedPassword = encrypt(newPassword);

      const updatedUser = await User.findByIdAndUpdate(
        { email: email },
        { password: encryptedPassword }
      );

      return response({
        type: 'SUCCESS',
        code: 200,
        message: 'Password updated successfully',
        data: email,
      });
    } catch (error) {
      return response({
        type: 'ERROR',
        code: 500,
        message: (error as Error).message,
      });
    }
  },

  generateOneTimePassword: async ({ params }: Request, res: Response) => {
    const { response } = useResponse(res);
    const TIME_TO_ADD = 15 * 1000;

    try {
      const { id } = params;

      const user = await User.findById(id);
      if (!user) throw new Error('User account not found');

      const code = Math.floor(Math.random() * 100000);
      const expiresAt = Date.now() + TIME_TO_ADD;

      const storeOtp = await User.findByIdAndUpdate(
        id,
        {
          'otp.code': code,
          'otp.expiresAt': expiresAt,
        },
        { new: true }
      );

      return response({
        type: 'SUCCESS',
        code: 200,
        message: 'One Time Password generated successfully',
        data: storeOtp?.otp,
      });
    } catch (error) {
      return response({
        type: 'ERROR',
        code: 500,
        message: (error as Error).message,
      });
    }
  },

  verifyOneTimePassword: async ({ body }: Request, res: Response) => {
    const { response } = useResponse(res);

    try {
      const { id, otp } = body;

      const user = await User.findById(id);
      if (!user) throw new Error('User account not found');

      const hasCodeExpired = Date.now() > user.otp.expiresAt;
      if (hasCodeExpired) throw new Error('One Time Password has expired');

      const isCodeOk = user.otp.code === otp.code;
      if (!isCodeOk) throw new Error('Invalid One Time Password');

      const unsetOtp = await User.findByIdAndUpdate(
        id,
        { 'otp.code': '', 'otp.expiresAt': 0 },
        { new: true }
      );

      return response({
        type: 'SUCCESS',
        code: 200,
        message: 'One Time Password verification successfully',
        data: unsetOtp?.otp,
      });
    } catch (error) {
      return response({
        type: 'ERROR',
        code: 500,
        message: (error as Error).message,
      });
    }
  },

  follow: async ({ body }: Request, res: Response) => {
    const { response } = useResponse(res);

    try {
      const { userId, followerId } = body;

      const userToFollow = await User.findById(userId);
      const follower = await User.findById(followerId);

      if (!userToFollow || !follower) throw new Error('User account not found');

      const alreadyFollowed = userToFollow.followers.includes(followerId);
      const followUser = [...userToFollow.followers, followerId];
      const unFollowUser = userToFollow.followers.filter(
        (id) => id !== followerId
      );

      const data = alreadyFollowed ? unFollowUser : followUser;

      const storedFollowers = await User.findByIdAndUpdate(
        userId,
        { followers: data },
        { new: true }
      );

      const unFollowMessage = 'You have un-followed this account';
      const followMessage = 'User followed successfully';

      return response({
        type: 'SUCCESS',
        code: 200,
        message: alreadyFollowed ? unFollowMessage : followMessage,
        data: storedFollowers?.followers,
      });
    } catch (error) {
      return response({
        type: 'ERROR',
        code: 500,
        message: (error as Error).message,
      });
    }
  },

  saveProduct: async ({ body }: Request, res: Response) => {
    const { response } = useResponse(res);

    try {
      const { userId, productId } = body;

      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      const isProductSaved = user.saved.includes(productId);
      const saveProduct = [...user.saved, productId];
      const removeProduct = user.saved.filter((id) => id !== productId);

      const data = isProductSaved ? saveProduct : removeProduct;

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { saved: data },
        { new: true }
      );

      const saveMessage = 'Product saved successfully';
      const removeMessage = 'Product removed successfully';

      return response({
        type: 'SUCCESS',
        code: 200,
        message: isProductSaved ? removeMessage : saveMessage,
        data: updatedUser?.saved,
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
