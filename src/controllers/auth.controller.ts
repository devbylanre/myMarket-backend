import crypto from 'crypto';
import { Request, Response } from 'express';
import { User } from '../models/user.model';
import { Token } from '../models/token.model';
import { Notification } from '../models/notification.model';
import { useResponse } from '../lib/useResponse';
import { useMailer } from '../lib/useMailer';
import { usePassword } from '../lib/usePassword';
import { useToken } from '../lib/useToken';

const createUser = async ({ body }: Request, res: Response) => {
  const { firstName, lastName, email, password } = body;
  const { sendMail } = useMailer();
  const { encrypt } = usePassword();
  const { response } = useResponse(res);

  try {
    const name = `${firstName} ${lastName}`;
    const token = crypto.randomBytes(128).toString('hex');
    console.log(crypto.randomBytes(64).toString('hex'));
    const encryptedPassword = encrypt(password);

    // Find user
    const existingUser = await User.findOne({ email });
    if (existingUser)
      throw new Error('Email is already registered to another user');

    // Register user
    const user = await User.create({ ...body, password: encryptedPassword });

    // Create a verification token
    const verification = new Token({ user: user._id, token: token });
    await verification.save();

    // Create a notification
    const notification = new Notification({
      reference: user._id,
      type: 'SIGN_UP',
      message: 'Welcome to MyMarket...',
    });
    await notification.save();

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
};

const authenticateUser = async ({ body }: Request, res: Response) => {
  const { response } = useResponse(res);
  const { isMatch } = usePassword();
  const { sign, expire } = useToken();

  try {
    const { password, email } = body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) throw new Error('We could not find your account');

    // If user was found, check if user is verified
    if (!user.isVerified) throw new Error('Your account is not verified');

    // If user was found, confirm password is correct
    const passwordMatch = isMatch(password, user.password);
    if (!passwordMatch) throw new Error('Invalid password, try again');

    // Create a json web token
    const token = sign({ id: user._id }, '24d');

    // Get json web token expiration date
    const expiresAt = expire(token);

    return response({
      type: 'SUCCESS',
      code: 200,
      message: 'User authentication successful',
      data: { ...user.toObject(), session: { token, expiresAt } },
    });
  } catch (error) {
    return response({
      type: 'ERROR',
      code: 500,
      message: (error as Error).message,
    });
  }
};
