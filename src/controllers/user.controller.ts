import { User } from '../models/user.model';
import { Request, Response } from 'express';
import crypto from 'crypto';
import config from '../configs/config';
import { useMailer } from '../lib/useMailer';
import { useResponse } from '../lib/useResponse';
import { usePassword } from '../lib/usePassword';
import { useToken } from '../lib/useToken';
import { useFirebase } from '../lib/useFirebase';
import { Notification } from '../models/notification.model';

const controller = {
  create: async ({ body }: Request, res: Response) => {
    const { mail } = useMailer();
    const { encrypt } = usePassword();
    const { response } = useResponse(res);

    try {
      const { firstName, lastName, email, password } = body;
      const name = `${firstName} ${lastName}`;
      const token = crypto.randomBytes(120).toString('hex');
      const encryptedPassword = encrypt(password);

      // Find user with email
      const existingUser = await User.findOne({ email });
      if (existingUser)
        throw new Error('Email is already registered to another user');

      // Register user
      const user = await User.create({
        ...body,
        password: encryptedPassword,
        token: token,
      });

      // Send an Email to the user about successful registration
      // const eMail = await mail({
      //   recipient: email,
      //   subject: 'Welcome to myMarket',
      //   file: 'welcome.ejs',
      //   data: {
      //     name: name,
      //     subject: 'Welcome to MyMarket',
      //     url: `${config.client}/verify?type=email&email=${body.email}&token=${token}`,
      //   },
      // });

      // Create a notification
      const notification = new Notification({
        reference: user._id,
        type: 'SIGN_UP',
        message: 'Welcome to MyMarket...',
      });

      return response({
        type: 'SUCCESS',
        code: 201,
        message: 'Account created successfully',
        data: { email, notification },
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
    const { response } = useResponse(res);
    const { isMatch } = usePassword();
    const { sign, expire } = useToken();

    try {
      const { password, email } = body;

      // find user by email
      const user = await User.findOne({ email }).select('-_id password');
      if (!user) throw new Error('We could not find your account');

      // confirm if password is correct
      const passwordMatch = isMatch(password, user.password);
      if (!passwordMatch) throw new Error('Invalid password, try again');

      const token = sign({ id: user._id }, '24d');
      const expiresAt = expire(token);

      return response({
        type: 'SUCCESS',
        code: 200,
        message: 'User authentication successful',
        data: { user, session: { token, expiresAt } },
      });
    } catch (error) {
      return response({
        type: 'ERROR',
        code: 500,
        message: (error as Error).message,
      });
    }
  },

  get: async ({ params: { userId } }: Request, res: Response) => {
    const { response } = useResponse(res);
    try {
      // find user by id
      const user = await User.findById(userId);
      if (!user) throw new Error('User account not found');

      const { password, ...data } = user.toObject();

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

  update: async ({ params: { userId }, body }: Request, res: Response) => {
    const { response } = useResponse(res);

    try {
      const { otp, verification, password, email, ...payload } = body;

      // find user by id
      const user = await User.findById(userId);
      if (!user) throw new Error('User account not found');

      // update user data
      const updatedUser = await User.findByIdAndUpdate(userId, { ...payload });

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

  uploadPhoto: async ({ file, body: { userId } }: Request, res: Response) => {
    const { response } = useResponse(res);
    const { deleteFile, uploadFile, fileName, getUrl } = useFirebase();

    try {
      // throe error if no file was uploaded
      if (!file) throw new Error('No file was provided');

      // find user account
      const user = await User.findById(userId);
      if (!user) throw new Error('User account not found');

      // check if file exists
      if (user.photo?.name) {
        const photo = user.photo.name;
        await deleteFile(photo, '/photos'); // delete photo from storage
      }

      const photoName = fileName(file.originalname, userId);
      const photo = await uploadFile(file.buffer, photoName, '/photos');
      const photoUrl = getUrl(photo.ref);

      // store file data
      const savedPhoto = await User.findByIdAndUpdate(
        userId,
        { 'photo.name': photoName, 'photo.url': photoUrl },
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
      // find user by email
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

      // find user by email
      const user = await User.findOne({ email: email });
      if (!user) throw new Error(`User account not found`);

      // check if password is correct
      const isPasswordValid = isMatch(oldPassword, user.password);
      if (!isPasswordValid) throw new Error('Incorrect password, try again');

      // encrypt new password
      const encryptedPassword = encrypt(newPassword);

      // store new password
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
};

export default controller;
