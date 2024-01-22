import mongoose, { ObjectId, Types } from 'mongoose';
import { User } from '../models/user.model';
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config';
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

const firebaseApp = initializeApp(config.firebase);
const storage = getStorage(firebaseApp);

const createUser = async (
  { body: { email, firstName, lastName, bio, password } }: Request,
  res: Response
) => {
  const { response } = useResponse(res);
  const { mail } = useMailer();
  const { encrypt } = usePassword();

  // generate a verification token
  const generateVerificationToken = () => {
    return crypto.randomBytes(40).toString('hex');
  };

  // create a notification doc for the process
  const notify = async (id: Types.ObjectId) => {
    createNotification({
      type: 'SIGN_UP',
      recipient: id,
      message: `Welcome aboard, ${firstName} ${lastName}! 🚀 Get started with your personalized journey`,
    });
  };

  // send a mail to the user
  const sendAnEMail = (token: string) => {
    mail({
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
    const user = await User.findOne({ email: email });

    // check if user already exists with the provided email address
    if (user) {
      return response({
        type: 'ERROR',
        code: 400,
        message: 'An account already exists with the provided email address',
      });
    }

    const token = generateVerificationToken();
    const encryptedPassword = encrypt(password);

    await createUser(token, encryptedPassword);
    sendAnEMail(token);

    return response({
      type: 'SUCCESS',
      code: 201,
      message: 'Account created successfully',
      data: { firstName, lastName, email, bio },
    });
  } catch (error) {
    return response({
      type: 'ERROR',
      code: 500,
      message: (error as Error).message,
    });
  }
};

const authenticate = (req: Request, res: Response) => {
  const payload = req.body;

  const getUser = async () => {
    await User.findOne({ email: payload.email })
      .then((user) => {
        return user;
      })
      .catch((error) => {
        console.error(error);
        return res.status(401).json();
      });
  };

  const isUserVerified = async (isVerified: boolean) => {
    if (!isVerified) {
    }
  };

  const passwordMatch = (encrypted: string) => {
    const isMatch = bcrypt.compareSync(payload.password, encrypted);
    return isMatch;
  };

  const generateToken = (id: string) => {
    const token = jwt.sign({ id: id }, config.secretKey, { expiresIn: '31d' });
    return token;
  };

  const tokenExpirationDate = (token: string) => {
    const data = jwt.decode(token);
    return data ? (data as Record<string, any>).exp : null;
  };
};

const verify = (req: Request, res: Response) => {
  const { token } = req.body;

  const getID = () => {
    let id: unknown = null;
    const check = jwt.verify(
      token,
      config.secretKey,
      (error: unknown, data: unknown) => {
        if (error) {
        }

        id = (data as Record<string, any>).id;
      }
    );

    return check;
  };

  const getUser = async (id: string) => {
    const user = await User.findById(id);
    return user;
  };
};

const fetch = async (req: Request, res: Response) => {
  const { token } = req.body;

  const getID = () => {};

  const getUser = async (id: string) => {
    const user = await User.findById(id);
    return user;
  };
};

const update = async (req: Request, res: Response) => {
  const { token, ...payload } = req.body;

  const getID = () => {};

  const storeExist = async (name: string) => {
    const check = await User.findOne({ 'store.name': name });
  };

  const updateUser = async (id: string) => {
    const query = await User.findByIdAndUpdate(id, payload);
  };
};

const uploadPhoto = async (req: Request, res: Response) => {
  const file = req.file;
  const { token } = req.body;

  if (!file) {
    return;
  }

  const getID = () => {};

  const getUser = async (id: string) => {
    const user = await User.findById(id);
  };

  const encrypt = (id: string) => {
    const data = `${id}-${Date.now()}${path.extname(file.originalname)}`;
    return data;
  };

  const deletePhoto = async (name: string) => {
    if (name) {
      const photo = ref(storage, `/photos/${name}`);
      await deleteObject(photo);
    }
  };

  const storePhoto = async (encrypted: string) => {
    const photo = ref(storage, `photos/${encrypted}`);
    const snapshot = await uploadBytes(photo, file.buffer);
    const url = getDownloadURL(snapshot.ref);
  };
};

const products = async (req: Request, res: Response) => {
  const { token } = req.body;

  const getID = () => {};

  const products = async () => {};
};

const verifyEmail = async (req: Request, res: Response) => {
  const { email, token } = req.body;

  const getID = () => {};

  const isVerified = (storedToken: string, token: string) => {
    const check = storedToken === token;
    return check;
  };

  const updateUser = async (id: string) => {
    const update = await User.findByIdAndUpdate(id, {});
  };

  const getUser = async (id: string) => {
    const user = await User.findById(id);
  };
};

const changeEmail = async (req: Request, res: Response) => {
  const { email, token } = req.body;

  const getID = () => {};

  const getUser = async (id: string) => {
    const user = await User.findById(id);
  };

  const changeEmail = async (id: string, email: string) => {
    const change = await User.findByIdAndUpdate(id, { email: email });
  };
};

const changePassword = async (req: Request, res: Response) => {
  const isPasswordMatch = (password: string, encrypted: string) => {
    const match = bcrypt.compareSync(password, encrypted);
    return match;
  };

  const encryptNewPassword = (password: string) => {
    const salt = bcrypt.genSaltSync(10);
    const encrypt = bcrypt.hashSync(password, 10);
    return encrypt;
  };

  const update = async (id: string, encrypted: string) => {
    const user = await User.findByIdAndDelete(id, { password: encrypted });
  };
};

const generateOneTimePassword = async (req: Request, res: Response) => {
  const {} = req.body;

  const getUser = async () => {};

  const oneTimePassword = () => {
    let token = '';

    for (let i = 0; i < 6; i++) {
      const randomNumber = Math.floor(Math.random() * 10);
      // token[i] += randomNumber; error storing index in token
    }

    return token;
  };

  const storeOneTimePassword = async (id: string, token: string) => {
    const store = await User.findByIdAndUpdate(id, {});
  };
};

const verifyOneTimePassword = async (req: Request, res: Response) => {
  const { otp } = req.body;

  const getUser = async () => {};

  const verify = (otp: string, storedOtp: string) => {
    const check = otp === storedOtp;
    return check;
  };

  const update = async (id: string) => {
    const run = await User.findByIdAndUpdate(id, {});
  };
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

export { createUser };
