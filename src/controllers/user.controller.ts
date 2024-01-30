import { User } from '../models/user.model';
import { Request, Response } from 'express';
import { useResponse } from '../lib/useResponse';
import { usePassword } from '../lib/usePassword';
import { useFirebase } from '../lib/useFirebase';

const controller = {
  get: async ({ body }: Request, res: Response) => {
    const { response } = useResponse(res);
    const { userId } = body;

    try {
      // Find user
      const user = await User.findById(userId).select('-password');
      if (!user) throw new Error('User account not found');

      return response({
        type: 'SUCCESS',
        code: 200,
        message: 'User verification successful',
        data: user,
      });
    } catch (error) {
      return response({
        type: 'ERROR',
        code: 500,
        message: (error as Error).message,
      });
    }
  },

  verify: async ({ body }: Request, res: Response) => {
    const { response } = useResponse(res);
    const { email } = body;

    try {
      // Find user
      const user = await User.findOne({ email }).select('-password');
      if (!user) throw new Error('Unable to find user');

      return response({
        type: 'SUCCESS',
        code: 200,
        message: 'User successfully updated',
        data: user,
      });
    } catch (error) {
      return response({
        type: 'ERROR',
        code: 500,
        message: (error as Error).message,
      });
    }
  },

  update: async ({ body }: Request, res: Response) => {
    const { response } = useResponse(res);
    const { password, email, userId, ...payload } = body;

    try {
      // Find user
      const user = await User.findById(userId);
      if (!user) throw new Error('User account not found');

      // If user was found, update user data
      const updateUser = await User.findByIdAndUpdate(userId, payload);
      if (!updateUser) throw new Error('Unable to update user data');

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

  uploadPhoto: async ({ file, body }: Request, res: Response) => {
    const { response } = useResponse(res);
    const { deleteFile, uploadFile, fileName, getUrl } = useFirebase();
    const { userId } = body;

    try {
      // Throw an error if file does not exist
      if (!file) throw new Error('No file was provided');

      // Find user
      const user = await User.findById(userId);
      if (!user) throw new Error('User account not found');

      // Check if a file has been stored
      const previousPhoto = user.photo.name;
      if (previousPhoto) {
        // Delete the store file
        await deleteFile(previousPhoto, '/photos');
      }

      const newPhoto = fileName(file.originalname, userId);
      const uploadedPhoto = await uploadFile(file.buffer, newPhoto, '/photos');
      const photoUrl = await getUrl(uploadedPhoto.ref);

      // store file data
      const savePhoto = await User.findByIdAndUpdate(
        userId,
        { 'photo.name': newPhoto, 'photo.url': photoUrl },
        { new: true }
      );
      if (!savePhoto) throw new Error('Unable to save photo');

      return response({
        type: 'SUCCESS',
        code: 200,
        message: 'User updated successfully',
        data: savePhoto.photo,
      });
    } catch (error) {
      return response({
        type: 'ERROR',
        code: 500,
        message: (error as Error).message,
      });
    }
  },

  changeEmail: async ({ body, params }: Request, res: Response) => {
    const { response } = useResponse(res);
    const { isMatch } = usePassword();
    const { email, password } = body;
    const { userId } = params;

    try {
      // Find user
      const user = await User.findById(userId);
      if (!user) throw new Error('User account not registered');

      // If user was found, check if password is correct
      const isPasswordValid = isMatch(password, user.password);
      if (!isPasswordValid) throw new Error('Incorrect password, try again');

      // Update user
      const updateUser = await User.findById(
        userId,
        { email: email },
        { new: true }
      );
      if (!updateUser) throw new Error('Unable to update user data');

      return response({
        type: 'SUCCESS',
        code: 200,
        message: 'Email updated successfully',
        data: updateUser.email,
      });
    } catch (error) {
      return response({
        type: 'ERROR',
        code: 500,
        message: (error as Error).message,
      });
    }
  },

  changePassword: async ({ body, params }: Request, res: Response) => {
    const { response } = useResponse(res);
    const { isMatch, encrypt } = usePassword();
    const { userId } = params;
    const { oldPassword, newPassword } = body;

    try {
      // Find user
      const user = await User.findById(userId);
      if (!user) throw new Error(`User account not found`);

      // If user was found, check if password is correct
      const isPasswordValid = isMatch(oldPassword, user.password);
      if (!isPasswordValid) throw new Error('Incorrect password, try again');

      // Encrypt new password
      const encryptedPassword = encrypt(newPassword);

      // store new password
      const updateUser = await User.findByIdAndUpdate(userId, {
        password: encryptedPassword,
      });
      if (!updateUser) throw new Error('Unable to update user data');

      return response({
        type: 'SUCCESS',
        code: 200,
        message: 'Password updated successfully',
        data: null,
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
