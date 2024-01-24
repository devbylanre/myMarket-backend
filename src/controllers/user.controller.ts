import { User } from '../models/user.model';
import { Request, Response } from 'express';
import crypto from 'crypto';
import config from '../configs/config';
import { createNotification } from './notification.controller';
import { useMailer } from '../lib/useMailer';
import { useResponse } from '../lib/useResponse';
import { usePassword } from '../lib/usePassword';
import { useToken } from '../lib/useToken';
import { useArray } from '../lib/useArray';
import { useFirebase } from '../lib/useFirebase';

const controller = {
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

      if (existingUser)
        throw new Error('Email is already registered to another user');

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
      // find user by email
      const user = await User.findOne({ email: body.email });
      if (!user) throw new Error('We could not find your account');

      // confirm if password is correct
      const passwordMatch = isMatch(body.password, user.password);
      if (!passwordMatch) throw new Error('Invalid password, try again');

      const token = sign({ id: user._id }, '24d'); // create json web token
      const expiresAt = expire(token); // get token expiration time

      const { verification, password, ...data } = user.toObject();

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

  get: async ({ params: { userId } }: Request, res: Response) => {
    const { response } = useResponse(res);
    try {
      // find user by id
      const user = await User.findById(userId);
      if (!user) throw new Error('User account not found');

      const { verification, password, ...data } = user.toObject();

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

  verifyEmail: async ({ body }: Request, res: Response) => {
    const { response } = useResponse(res);

    try {
      const { email, token } = body;

      // find user by email
      const user = await User.findOne({ email: email });
      if (!user) throw new Error('User account not found');

      const isUserVerified = user.verification?.isVerified;

      // check if user is verified
      if (isUserVerified) throw new Error('This email is already verified');

      // check if token is valid
      const isTokenValid = token === user.verification?.token;
      if (!isTokenValid) throw new Error('Verification token is not valid');

      // unset verification data
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

  follow: async ({ body }: Request, res: Response) => {
    const { response } = useResponse(res);

    try {
      const { userId, followerId } = body;

      // find user to follow by id
      const userToFollow = await User.findById(userId);
      // find follower by id
      const follower = await User.findById(followerId);

      // throw error if userToFollow or follower is not found
      if (!userToFollow || !follower) throw new Error('User account not found');

      // hook
      const { pop, push, includes } = useArray(userToFollow.followers);

      const hasFollowedUser = includes(followerId);
      const followUser = push(followerId);
      const unFollowUser = pop(followerId);

      // determine whether to follow or un follow user
      const data = hasFollowedUser ? unFollowUser : followUser;

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
        message: hasFollowedUser ? unFollowMessage : followMessage,
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

  getFollowers: async ({ query }: Request, res: Response) => {
    const { response } = useResponse(res);

    try {
      const { userId } = query;

      const user = await User.findById(userId).populate('followers');
      if (!user) throw new Error('Unable to find user account');

      if (!user.followers || user.followers.length === 0)
        throw new Error('We could not find any followers');

      return response({
        type: 'SUCCESS',
        code: 200,
        message: 'Followers fetched successfully',
        data: user,
      });
    } catch (error) {}
  },

  pinProduct: async ({ body }: Request, res: Response) => {
    const { response } = useResponse(res);

    try {
      const { userId, productId } = body;

      // find user by id
      const user = await User.findById(userId);
      // throw error if user is not found
      if (!user) throw new Error('User not found');

      // hook
      const { pop, push, includes } = useArray(user.pinned);

      const isProductPinned = includes(productId);
      const pinProduct = push(productId);
      const unpinProduct = pop(productId);

      // determine whether product should be saved or removed
      const data = isProductPinned ? unpinProduct : pinProduct;

      const storeProducts = await User.findByIdAndUpdate(
        userId,
        { saved: data },
        { new: true }
      );

      const pinnedMessage = 'Product saved successfully';
      const unpinnedMessage = 'Product removed successfully';

      return response({
        type: 'SUCCESS',
        code: 200,
        message: isProductPinned ? unpinnedMessage : pinnedMessage,
        data: storeProducts?.pinned,
      });
    } catch (error) {
      return response({
        type: 'ERROR',
        code: 500,
        message: (error as Error).message,
      });
    }
  },

  getPinnedProducts: async ({ params }: Request, res: Response) => {
    const { response } = useResponse(res);

    try {
      const { userId } = params;

      const user = await User.findById(userId);
      if (!user) throw new Error('Unable to find user account');

      const pinnedProducts = await User.findById(userId)
        .select('firstName lastName email _id')
        .populate('pinned');

      if (!pinnedProducts || pinnedProducts.pinned.length === 0)
        throw new Error('Your pinned library is empty');

      return response({
        type: 'SUCCESS',
        code: 200,
        message: 'Here is your pinned products',
        data: pinnedProducts.pinned,
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
