import mongoose, { ObjectId, Types } from 'mongoose';
import { User } from '../models/user.model';
import { Request, Response, response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import config from '../config';
import { createNotification } from './notification.controller';
import { useMailer } from '../lib/useMailer';
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
import { useResponse } from '../lib/useResponse';
import { usePassword } from '../lib/usePassword';
import { useToken } from '../lib/useToken';
import { Product } from '../models/product.model';

const firebaseApp = initializeApp(config.firebase);
const storage = getStorage(firebaseApp);

const createUser = async (
  { body: { email, firstName, lastName, bio, password } }: Request,
  res: Response
) => {
  const { mail } = useMailer();
  const { encrypt } = usePassword();
  const { response } = useResponse(res);

  const getUser = async () => {
    const user = await User.findOne({ email: email });
    if (!user) throw new Error('User not found');
    return user;
  };

  // generate a verification token
  const generateVerificationToken = () => {
    return crypto.randomBytes(40).toString('hex');
  };

  // create a notification doc for the process
  const signUpNotification = async (id: Types.ObjectId) => {
    return await createNotification({
      type: 'SIGN_UP',
      recipient: id,
      message: `Welcome aboard, ${firstName} ${lastName}! 🚀 Get started with your personalized journey`,
    });
  };

  // send a mail to the user
  const sendEmail = async (token: string) => {
    return await mail({
      recipient: email,
      subject: 'Welcome to myMarket',
      path: path.join(__dirname, '..', 'views', 'welcome.ejs'),
      data: {
        username: `${firstName} ${lastName}`,
        subject: 'Welcome to MyMarket',
        verificationUrl: `${config.client}/verify?type=email&email=${email}&token=${token}`,
      },
    });
  };

  const createUser = async (token: string, encrypted: string) => {
    return await User.create({
      firstName,
      lastName,
      email,
      bio,
      password: encrypted,
      'verification.token': token,
    });
  };

  try {
    const user = await getUser();

    const token = generateVerificationToken();
    const encryptedPassword = encrypt(password);

    const newUser = await createUser(token, encryptedPassword);
    const notification = await signUpNotification(newUser._id);
    const mail = await sendEmail(token);

    return response({
      type: 'SUCCESS',
      code: 201,
      message: 'Account created successfully',
      data: { firstName, lastName, email, bio, notification, mail },
    });
  } catch (error) {
    return response({
      type: 'ERROR',
      code: 500,
      message: (error as Error).message,
    });
  }
};

const authenticateUser = async ({ body }: Request, res: Response) => {
  const { isMatch } = usePassword();
  const { sign, expire } = useToken();
  const { response } = useResponse(res);

  const getUser = async () => {
    const user = await User.findOne({ email: body.email });
    if (!user) throw new Error('User not found');
    return user;
  };

  const isPasswordMatch = (encrypted: string) => {
    const result = isMatch(body.password, encrypted);

    if (!result) throw new Error('Password does not match');
  };

  try {
    const user = await getUser();
    isPasswordMatch(user.password);

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
};

const getUser = async ({ params: { id } }: Request, res: Response) => {
  const { response } = useResponse(res);

  const getUser = async () => {
    const user = await User.findById(id);
    if (!user) throw new Error('User not found');
    return user;
  };

  try {
    const user = await getUser();
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
};

const updateUser = async (
  {
    params: { id },
    body: { otp, verification, password, email, ...payload },
  }: Request,
  res: Response
) => {
  const { response } = useResponse(res);

  const getUser = async () => {
    const user = await User.findById(id);
    if (!user) throw new Error('User not found');
  };

  const storeAlreadyExists = async () => {
    const name = await User.findOne({ 'store.name': payload?.store?.name });

    if (name) throw new Error('Store name is taken, try using another name');
  };

  try {
    await getUser();
    await storeAlreadyExists();

    // update user
    await User.findByIdAndUpdate(id, payload);

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

const verifyUserEmail = async (
  { body: { email, verification } }: Request,
  res: Response
) => {
  const { response } = useResponse(res);

  const getUser = async () => {
    const user = await User.findOne({ email: email });
    // check if user does not exist
    if (!user) throw new Error('User not found');

    return user;
  };

  const isUserVerified = (isVerified: boolean) => {
    if (isVerified) throw new Error('User is already verified');
  };

  const isTokenValid = (token?: string) => {
    if (!token) throw new Error('User verification token is required');
    const check = token === verification.token;

    // check if user verification token is valid
    if (!check) {
      throw new Error('Invalid user verification token');
    }
  };

  try {
    const user = await getUser();

    if (user.verification) {
      isUserVerified(user.verification.isVerified);
      isTokenValid(user.verification.token);
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id },
      { verification: { token: '', isVerified: true } },
      { new: true }
    );

    return response({
      type: 'SUCCESS',
      code: 200,
      message: 'User email verification successfully',
      data: { email: updatedUser?.email },
    });
  } catch (error) {
    return response({
      type: 'ERROR',
      code: 500,
      message: (error as Error).message,
    });
  }
};

const uploadPhoto = async (
  { file, params: { id } }: Request,
  res: Response
) => {
  const { response } = useResponse(res);

  // check if no file was uploaded
  if (!file) throw new Error('No file was provided');

  const getUser = async () => {
    const user = await User.findById(id);
    if (!user) throw new Error('User not found');
    return user;
  };

  // creates a unique file name
  const createUniqueName = () => {
    const data = `${id}-${Date.now()}${path.extname(file.originalname)}`;
    return data;
  };

  // deletes an existing photo file
  const deletePhoto = async (name?: string) => {
    if (name) {
      const photo = ref(storage, `/photos/${name}`);
      await deleteObject(photo);
    }
  };

  // uploads a photo
  const uploadPhoto = async (encrypt: string) => {
    const photo = ref(storage, `photos/${encrypt}`);
    const snapshot = await uploadBytes(photo, file.buffer);
    const url = getDownloadURL(snapshot.ref);
    return url;
  };

  try {
    const user = await getUser();
    const name = createUniqueName();
    await deletePhoto(user.photo?.name);
    const url = await uploadPhoto(name);

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { photo: { name, url } },
      { new: true }
    );

    return response({
      type: 'SUCCESS',
      code: 200,
      message: 'User updated successfully',
      data: updatedUser?.photo,
    });
  } catch (error) {
    return response({
      type: 'ERROR',
      code: 500,
      message: (error as Error).message,
    });
  }
};

const getProducts = async ({ params: { id } }: Request, res: Response) => {
  const { response } = useResponse(res);

  const getUser = async () => {
    const user = await User.findById(id);
    if (!user) throw new Error('User not found');
    return user;
  };

  const getProducts = async () => {
    const products = await Product.find({ user: id });
    if (!products || products.length === 0)
      throw new Error('Product not found');
    return products;
  };

  try {
    await getUser();
    const products = await getProducts();

    return response({
      type: 'SUCCESS',
      code: 200,
      message: 'Products found successfully',
      data: products,
    });
  } catch (error) {
    return response({
      type: 'ERROR',
      code: 500,
      message: (error as Error).message,
    });
  }
};

const changeEmail = async ({ body: { email, id } }: Request, res: Response) => {
  const { response } = useResponse(res);

  const getUser = async () => {
    const user = await User.findById(id);
    if (!user) throw new Error('User not found');
    return user;
  };

  try {
    const user = await getUser();
  } catch (error) {
    return response({
      type: 'ERROR',
      code: 500,
      message: (error as Error).message,
    });
  }
};

const changePassword = async (
  { body: { email, oldPassword, newPassword } }: Request,
  res: Response
) => {
  const { response } = useResponse(res);
  const { isMatch, encrypt } = usePassword();

  // get user data
  const getUser = async () => {
    const user = await User.findOne({ email: email });
    if (!user) throw new Error('User not found');
    return user;
  };
  // check if the user password is correct
  const isPasswordMatch = (encrypted: string) => {
    const check = isMatch(oldPassword, encrypted);
    if (!check) throw new Error('Password does not match');
  };

  // encrypt the new user password
  const encryptNewPassword = () => {
    const encrypted = encrypt(newPassword);
    return encrypted;
  };

  try {
    const user = await getUser();
    isPasswordMatch(user.password);
    const password = encryptNewPassword();

    await User.findOneAndUpdate({ email: email }, { password: password });

    return response({
      type: 'SUCCESS',
      code: 200,
      message: 'User password updated successfully',
      data: email,
    });
  } catch (error) {
    return response({
      type: 'ERROR',
      code: 500,
      message: (error as Error).message,
    });
  }
};

const oneTimePassword = async ({ params: { id } }: Request, res: Response) => {
  const { response } = useResponse(res);
  const TIME_TO_ADD = 15 * 1000;

  const getUser = async () => {
    const user = await User.findById(id);
    if (!user) throw new Error('User not found');
    return user;
  };

  const createToken = () => {
    let token = '';
    for (let i = 0; i < 6; i++) {
      const randomNumber = Math.floor(Math.random() * 10);
      token += randomNumber;
    }
    return token;
  };

  const getTime = () => {
    const time = new Date().getTime();
    return time + TIME_TO_ADD;
  };

  try {
    const user = await getUser();
    const token = createToken();
    const expiresAt = getTime();

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { otp: { code: token, expiresAt } },
      { new: true }
    );

    return response({
      type: 'SUCCESS',
      code: 200,
      message: 'One time password generated successfully',
      data: updatedUser?.otp,
    });
  } catch (error) {
    return response({
      type: 'ERROR',
      code: 500,
      message: (error as Error).message,
    });
  }
};

const verifyOneTimePassword = async (
  { body: { otp }, params: { id } }: Request,
  res: Response
) => {
  const { response } = useResponse(res);

  // get user doc from database
  const getUser = async () => {
    const user = await User.findById(id);
    if (!user) throw new Error('User not found');
    return user;
  };

  // check if otp has expired
  const hasExpired = (expiresAt: number) => {
    const currentTime = Date.now();
    const check = currentTime > expiresAt;

    if (check) throw new Error('One Time Password has expired');
  };

  // check if otp token is valid
  const verify = (code: string) => {
    const check = otp.code === code;
    if (!check) throw new Error('One Time Password verification failed');
  };

  try {
    const user = await getUser();
    verify(user!.otp!.code);
    hasExpired(user.otp?.expiresAt!); // fix null error

    const updatedOtp = await User.findByIdAndUpdate(
      id,
      { otp: { code: '', expiresAt: 0 } },
      { new: true }
    );

    return response({
      type: 'SUCCESS',
      code: 500,
      message: 'One Time Password verification successful',
      data: updatedOtp?.otp,
    });
  } catch (error) {
    return response({
      type: 'ERROR',
      code: 500,
      message: (error as Error).message,
    });
  }
};

const followUser = async (req: Request, res: Response) => {
  const { token, id } = req.body;

  const getUser = async () => {};

  const isAlreadyFollowed = (id: string, followers: string[]) => {
    const check = followers.includes(id);
    return check;
  };

  const follow = (id: string, followers: string[]) => {
    const newFollowers = [...followers, id];
    return newFollowers;
  };

  const unFollow = (id: string, followers: string[]) => {
    const filter = followers.filter((user) => user !== id);
    return filter;
  };

  const update = async (id: string, data: string[]) => {
    const query = await User.findByIdAndUpdate(id, { followers: data });
  };
};

const storeProduct = async (req: Request, res: Response) => {
  const {} = req.body;

  const getUser = async () => {};

  const productExists = (id: string, products: string[]) => {
    const check = products.includes(id);
    return check;
  };

  const addProducts = (id: string, products: string[]) => {
    const newProducts = [...products, id];
    return newProducts;
  };

  const removeProducts = (id: string, products: string[]) => {
    const filter = products.filter((product) => product !== id);
    return filter;
  };

  const update = async (id: string, data: string[]) => {
    const query = await User.findByIdAndUpdate(id, { saved: data });
  };
};

export {
  createUser,
  authenticateUser,
  getUser,
  updateUser,
  verifyUserEmail,
  uploadPhoto,
};
