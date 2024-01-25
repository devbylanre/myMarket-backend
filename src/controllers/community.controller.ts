import { Request, Response } from 'express';
import { useResponse } from '../lib/useResponse';
import { Community } from '../models/community.model';
import { Types } from 'mongoose';

export const controller = {
  add: async ({ body, params }: Request, res: Response) => {
    const { response } = useResponse(res);

    try {
      const { user, userId } = body;
      const follower = params.follower as unknown;

      const docs = await Community.find({ reference: userId });

      const alreadyAdded = docs.find((doc) => doc.follower === follower);
      if (alreadyAdded) throw new Error('You are already following this user');

      const doc = await Community.create({ follower, reference: userId });

      return response({
        type: 'SUCCESS',
        code: 201,
        message: 'User added successfully',
        data: doc,
      });
    } catch (error) {
      return response({
        type: 'ERROR',
        code: 500,
        message: (error as Error).message,
      });
    }
  },

  remove: async ({ params }: Request, res: Response) => {
    const { response } = useResponse(res);

    try {
      const { follower } = params;

      const doc = await Community.findOneAndDelete({ follower: follower });
      if (!doc) throw new Error('Unable to remove follower');

      return response({
        type: 'SUCCESS',
        code: 200,
        message: 'User removed successfully',
        data: doc,
      });
    } catch (error) {
      return response({
        type: 'ERROR',
        code: 500,
        message: (error as Error).message,
      });
    }
  },

  following: async ({ body }: Request, res: Response) => {
    const { response } = useResponse(res);

    try {
      const { userId } = body;

      const docs = await Community.find({ follower: userId })
        .select('')
        .populate('');

      if (!docs || docs.length === 0)
        throw new Error('You have followed no community');

      return response({
        type: 'SUCCESS',
        code: 200,
        message: `Found ${docs.length} communities`,
        data: docs,
      });
    } catch (error) {
      return response({
        type: 'ERROR',
        code: 500,
        message: (error as Error).message,
      });
    }
  },

  followers: async ({ body }: Request, res: Response) => {
    const { response } = useResponse(res);

    try {
      const { userId } = body;

      const docs = await Community.find({ reference: userId })
        .select('followers')
        .populate('followers');

      if (!docs || docs.length === 0)
        throw new Error('Your community has no followers');

      return response({
        type: 'SUCCESS',
        code: 200,
        message: `Found ${docs.length} followers`,
        data: docs,
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
