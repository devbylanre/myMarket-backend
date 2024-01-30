import crypto from 'crypto';
import { Request, Response } from 'express';
import { User } from '../models/user.model';
import { Token } from '../models/token.model';
import { Notification } from '../models/notification.model';
import { useResponse } from '../lib/useResponse';
import { useMailer } from '../lib/useMailer';
import { usePassword } from '../lib/usePassword';
import { useToken } from '../lib/useToken';
import config from '../configs/config';
import { JwtPayload } from 'jsonwebtoken';

const createUser = async ({ body }: Request, res: Response) => {
  const { firstName, lastName, email, password } = body;
  const { sendMail } = useMailer();
  const { encrypt } = usePassword();
  const { response } = useResponse(res);

  try {
    const token = crypto.randomBytes(128).toString('hex');
    const encryptedPassword = encrypt(password);

    // Find user
    const existingUser = await User.findOne({ email });
    if (existingUser)
      throw new Error('Email is already registered to another user');

    // Register user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: encryptedPassword,
    });

    // Create a verification token
    const verification = await Token.create({ user: user._id, token: token });

    // Create a notification
    const notification = await Notification.create({
      reference: user._id,
      type: 'SIGN_UP',
      message: 'Welcome to MyMarket...',
    });

    return response({
      type: 'SUCCESS',
      code: 201,
      message: 'Account created successfully',
      data: { email, notification, verification },
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
  const { generateToken } = useToken();

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

    // Create json web tokens (access and refresh token)
    const accessToken = generateToken(
      { userId: user._id },
      config.accessToken,
      '15m'
    );
    const refreshToken = generateToken(
      { userId: user._id },
      config.refreshToken,
      '14d'
    );

    return response({
      type: 'SUCCESS',
      code: 200,
      message: 'User authentication successful',
      data: { user, accessToken, refreshToken },
    });
  } catch (error) {
    return response({
      type: 'ERROR',
      code: 500,
      message: (error as Error).message,
    });
  }
};

const destroy = async (req: Request, res: Response) => {
  const { response } = useResponse(res);

  try {
  } catch (error) {
    return response({
      type: 'ERROR',
      code: 500,
      message: (error as Error).message,
    });
  }
};

const refreshToken = async ({ body }: Request, res: Response) => {
  const { token } = body;
  const { response } = useResponse(res);
  const { verifyToken, generateToken } = useToken();

  try {
    // Verify the token
    const result = verifyToken(token, config.refreshToken);

    // Create a new access token
    const accessToken = generateToken(
      { userId: (result as JwtPayload).userId },
      config.accessToken,
      '14d'
    );

    return response({
      type: 'SUCCESS',
      code: 201,
      message: 'Token refresh successful',
      data: { accessToken },
    });
  } catch (error) {
    return response({
      type: 'ERROR',
      code: 500,
      message: (error as Error).message,
    });
  }
};

export { createUser, authenticateUser, refreshToken, destroy };
