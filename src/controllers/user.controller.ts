import { User } from '../models/user.model';
import { Request, Response } from 'express';
import { useResponse } from '../lib/useResponse';
import { usePassword } from '../lib/usePassword';
import { useFirebase } from '../lib/useFirebase';

const getUser = async ({ body }: Request, res: Response) => {
  const { response } = useResponse(res);
  const { userId } = body;

  try {
    // Find user
    const user = await User.findById(userId).select('-password');
    if (!user) throw new Error('User account not found');

    return response({
      type: 'SUCCESS',
      code: 200,
      message: 'User fetched successful',
      data: user,
    });
  } catch (error) {
    return response({
      type: 'ERROR',
      code: 500,
      message: (error as Error).message,
    });
  }
};

const updateUser = async ({ body }: Request, res: Response) => {
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
};

const uploadUserPhoto = async ({ body, file }: Request, res: Response) => {
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
};

const changeUserEmail = async ({ body }: Request, res: Response) => {
  const { response } = useResponse(res);
  const { isMatch } = usePassword();
  const { userId, email, password } = body;

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
};

const changeUserPassword = async ({ body }: Request, res: Response) => {
  const { response } = useResponse(res);
  const { isMatch, encrypt } = usePassword();
  const { userId, oldPassword, newPassword } = body;

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
};

export {
  getUser,
  updateUser,
  uploadUserPhoto,
  changeUserEmail,
  changeUserPassword,
};
