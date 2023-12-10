import mongoose, { ObjectId, Types } from 'mongoose';
import { User, UserTypes } from '../models/user.model';
import { validationResult } from 'express-validator';
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import os from 'os';
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

  private async findById(id: Types.ObjectId) {
    const result = await User.findById(id);
    return result;
  }

  private async create(data: UserTypes) {
    const result = await User.create(data);
    return result;
  }

  private async update(id: Types.ObjectId, data: Record<string, any>) {
    const result = await User.findByIdAndUpdate({ id, data }, { new: true });
    return result;
  }

  private async delete(id: Types.ObjectId) {
    const result = await User.findByIdAndDelete({ id });
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
          .json(this.createErrorResponse(422, 'User does not exist', id));
      }

      const result = await this.update(id as any, data);

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

  async resetEmail(req: Request, res: Response) {
    try {
      const { id } = req.params;
    } catch (err) {}
  }
}
