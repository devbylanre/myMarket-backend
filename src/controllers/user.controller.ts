import mongoose, { Types } from 'mongoose';
import { User, UserTypes } from '../models/user.model';
import { validationResult } from 'express-validator';
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { NotificationController } from './notification.controller';

interface ApiResponse<T = unknown> {
  state: string;
  data?: T;
  message?: any;
  error?: {
    code: number;
    message: string;
    details: any;
  };
}

const notification = new NotificationController();

export class UserController {
  private async find(query?: Record<string, any>) {
    const result = query ? await User.find(query) : await User.find();
    return result;
  }

  private async findOne(query: Record<string, any>) {
    const result = await User.findOne(query);
    return result;
  }

  private async findById(id: string) {
    const result = await User.findById(id);
    return result;
  }

  private async create(data: UserTypes) {
    const result = await User.create(data);
    return result;
  }

  private async update(id: string, data: Record<string, any>) {
    const result = await User.findByIdAndUpdate(id, data, { new: true });
    return result;
  }

  private async delete(id: Types.ObjectId) {
    const result = await User.findByIdAndDelete(id);
    return result;
  }

  private validateRoute(req: Request) {
    const errors = validationResult(req);
    return errors;
  }

  private createErrorResponse(
    code: number,
    message: string,
    details: any
  ): ApiResponse {
    return {
      state: 'error',
      error: { code, message, details },
    };
  }

  private createSuccessResponse<T>(data: T, message: string): ApiResponse {
    return {
      state: 'success',
      data: data,
      message: message,
    };
  }

  private createToken(id: mongoose.Types.ObjectId) {
    return jwt.sign({ _id: id }, config.secret_key, { expiresIn: '24d' });
  }

  private hashPassword(data: string) {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(data, salt);
  }

  private verifyPassword(data: string, encrypted: string) {
    return bcrypt.compareSync(data, encrypted);
  }

  private generateOTP(length: number) {
    let token = '';

    for (let i = 0; i < length; i++) {
      const num = Math.floor(Math.random() * 10).toString();
      token += num;
    }

    return token;
  }

  async createUser(req: Request, res: Response) {
    try {
      const data = req.body;
      const errors = this.validateRoute(req);

      // check if there's any validation error
      if (!errors.isEmpty()) {
        return res
          .status(422)
          .json(
            this.createErrorResponse(422, 'Validation error', errors.array())
          );
      }

      // find if email already exists
      const userExists = await this.findOne({
        'contact.email': data.contact.email,
      });

      if (userExists) {
        return res
          .status(400)
          .json(
            this.createErrorResponse(
              400,
              'Email is already registered to another user',
              data.contact.email
            )
          );
      }

      // hash password
      const hashPassword = this.hashPassword(data.password as string);

      // create user
      const user = await this.create({ ...data, password: hashPassword });

      await notification.createNotification({
        userId: user._id,
        message: 'Welcome to the #1 marketplace',
        activityType: 'user',
      });

      return res
        .status(200)
        .json(
          this.createSuccessResponse(user, 'User registration successfully')
        );
    } catch (err: any) {
      return res
        .status(500)
        .json(
          this.createErrorResponse(
            500,
            'Unable to complete user registration',
            err.message
          )
        );
    }
  }

  async authUser(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // check for field errors
      const errors = this.validateRoute(req);

      if (!errors.isEmpty()) {
        return res
          .status(422)
          .json(
            this.createErrorResponse(422, 'Validation error', errors.array())
          );
      }

      // find the user
      const user = await this.findOne({ 'contact.email': email });

      if (!user) {
        return res
          .status(400)
          .json(this.createErrorResponse(400, 'User does not exist', email));
      }

      // verify password
      const isPasswordMatch = this.verifyPassword(password, user.password);

      if (!isPasswordMatch) {
        return res
          .status(400)
          .json(
            this.createErrorResponse(400, 'Password does not match', password)
          );
      }

      const token = this.createToken(user._id);

      return res
        .status(200)
        .json(
          this.createSuccessResponse(
            { user, token },
            'User authentication successful'
          )
        );
    } catch (err: any) {
      return res
        .status(500)
        .json(
          this.createErrorResponse(
            500,
            'Unable to authenticate user',
            err.message
          )
        );
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;

      const errors = this.validateRoute(req);

      if (!errors.isEmpty()) {
        return res
          .status(422)
          .json(
            this.createErrorResponse(422, 'Validation error', errors.array())
          );
      }

      const userExists = await this.findById(id as any);

      if (!userExists) {
        return res
          .status(422)
          .json(
            this.createErrorResponse(
              422,
              'Cannot update a user that does not exist',
              id
            )
          );
      }

      const result = await this.update(id, data);

      return res
        .status(200)
        .json(this.createSuccessResponse(result, 'User updated successfully'));
    } catch (err: any) {
      return res
        .status(500)
        .json(
          this.createErrorResponse(
            500,
            'Unable to update user data',
            err.message
          )
        );
    }
  }

  async fetchUser(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = await this.findById(id);

      if (!user) {
        return res
          .status(404)
          .json(this.createErrorResponse(500, 'User not found', id));
      }

      const { password, ...userData } = user.toObject();

      return res
        .status(200)
        .json(
          this.createSuccessResponse(userData, 'User data fetched successfully')
        );
    } catch (err: any) {
      return res
        .status(500)
        .json(
          this.createErrorResponse(
            500,
            'Unable to fetch user data',
            err.message
          )
        );
    }
  }

  async generateToken(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = await this.findById(id);

      if (!user) {
        return res
          .status(404)
          .json(this.createErrorResponse(404, 'User not found', id));
      }

      const token = this.generateOTP(6);
      const expirationTime = new Date().setTime(new Date().getTime() + 15000);

      const result: any = await this.update(id, {
        'token.key': token,
        'token.expiration': expirationTime,
      });

      return res
        .status(200)
        .json(
          this.createSuccessResponse(
            result.token,
            'Token generated successfully'
          )
        );
    } catch (err: any) {
      return res
        .status(500)
        .json(
          this.createErrorResponse(500, 'Unable to generate toke', err.message)
        );
    }
  }

  async verifyToken(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { key } = req.body;

      const errors = this.validateRoute(req);

      if (!errors.isEmpty()) {
        return res
          .status(422)
          .json(
            this.createErrorResponse(422, 'Validation failed', errors.array())
          );
      }

      // find user
      const user = await this.findById(id);

      // check if user exists
      if (!user) {
        return res
          .status(404)
          .json(this.createErrorResponse(404, 'User not found', id));
      }

      // check if token exist
      if (!user.token.key) {
        return res
          .status(400)
          .json(this.createErrorResponse(400, 'No token found', id));
      }

      // check if the user token key matches the provided key
      if (user.token.key !== key) {
        return res
          .status(400)
          .json(this.createErrorResponse(400, 'Invalid token', key));
      }

      const currentTime = new Date().getTime();

      // check if current time is greater than the token expiration time
      if (currentTime > user.token.expiration) {
        await this.update(id, { 'token.key': '', 'token.expiration': 0 });
        return res
          .status(400)
          .json(this.createErrorResponse(400, 'Token has expired', id));
      } else {
        await this.update(id, { 'token.key': '', 'token.expiration': 0 }); //
        return res
          .status(200)
          .json(
            this.createSuccessResponse(
              user.token,
              'Token verification successful'
            )
          );
      }
    } catch (err: any) {
      res
        .status(500)
        .json(
          this.createErrorResponse(500, 'Unable to verify token', err.message)
        );
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { oldPassword, newPassword } = req.body;

      // field errors
      const errors = this.validateRoute(req);

      // check if field errors is not empty
      if (!errors.isEmpty()) {
        return res
          .status(422)
          .json(
            this.createErrorResponse(
              500,
              'Field validation error',
              errors.array()
            )
          );
      }

      // find user
      const user = await this.findById(id);

      // check if user was not found
      if (!user) {
        return res
          .status(404)
          .json(this.createErrorResponse(404, 'User not found', id));
      }

      const isPasswordMatch = this.verifyPassword(oldPassword, user.password);

      // check if password does not match
      if (!isPasswordMatch) {
        return res
          .status(400)
          .json(
            this.createErrorResponse(
              400,
              'Your password does not match',
              oldPassword
            )
          );
      }

      // hash the new password
      const hashPassword = this.hashPassword(newPassword);

      // update the user password
      const result = await this.update(id, { password: hashPassword });

      return res
        .status(200)
        .json(
          this.createSuccessResponse(result, 'Password updated successfully')
        );
    } catch (err: any) {
      return res
        .status(500)
        .json(
          this.createErrorResponse(
            500,
            'Unable to update password',
            err.message
          )
        );
    }
  }

  async changeEmail(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { email } = req.body;

      // field errors
      const errors = this.validateRoute(req);

      // check if field errors is not empty
      if (!errors.isEmpty()) {
        return res
          .status(422)
          .json(
            this.createErrorResponse(
              422,
              'Field validation error',
              errors.array()
            )
          );
      }

      // find user
      const user = await this.findById(id);

      // check if user does not exist
      if (!user) {
        return res
          .status(404)
          .json(this.createErrorResponse(404, 'User not found', id));
      }

      // update or change user email address
      const result = await this.update(id, { 'contact.email': email });

      return res
        .status(200)
        .json(this.createSuccessResponse(result, 'Email updated successfully'));
    } catch (err: any) {}
  }

  async changeMobile(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { mobile } = req.body;

      const errors = this.validateRoute(req);

      if (!errors.isEmpty()) {
        return res
          .status(422)
          .json(
            this.createErrorResponse(
              422,
              'Field validation error',
              errors.array()
            )
          );
      }

      const user = await this.findById(id);

      if (!user) {
        return res
          .status(400)
          .json(this.createErrorResponse(404, 'User not found', id));
      }

      const result = await this.update(id, { 'contact.mobile': mobile });

      return res
        .status(200)
        .json(
          this.createSuccessResponse(
            result,
            'User mobile contact updated successfully'
          )
        );
    } catch {}
  }
}
