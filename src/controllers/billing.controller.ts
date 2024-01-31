import { Request, Response } from 'express';
import { useResponse } from '../lib/useResponse';
import { Billing } from '../models/billing.model';
import { useMailer } from '../lib/useMailer';

export const createBilling = async ({ body }: Request, res: Response) => {
  const { response } = useResponse(res);
  const { sendMail } = useMailer();

  try {
    const { country, state, city, address, userId } = body;

    // send an email to the user about his billing information

    const doc = await Billing.findByIdAndUpdate(
      userId,
      { country, state, city, address, user: userId },
      { upsert: true, new: true }
    );

    if (!doc) throw new Error('Unable to create billing');

    return response({
      type: 'SUCCESS',
      code: 201,
      message: 'Billing created successfully',
      data: doc,
    });
  } catch (error) {
    console.log(error);
    return response({
      type: 'ERROR',
      code: 500,
      message: (error as Error).message,
    });
  }
};

export const getBilling = async ({ body }: Request, res: Response) => {
  const { userId } = body;
  const { response } = useResponse(res);

  try {
    // Find the billing document
    const doc = await Billing.findOne({ user: userId });
    if (!doc) throw new Error('Billing document not found');

    return response({
      type: 'SUCCESS',
      code: 200,
      message: 'Billing document fetched successfully',
      data: doc,
    });
  } catch (error) {
    return response({
      type: 'ERROR',
      code: 500,
      message: (error as Error).message,
    });
  }
};

export const updateBilling = async ({ body }: Request, res: Response) => {
  const { userId, state, address, city, country } = body;
  const { response } = useResponse(res);

  try {
    // Find the billing document
    const doc = await Billing.findOne({ user: userId });
    if (!doc) throw new Error('No billing attached to the user');

    // Update the billing document
    const updateDoc = await Billing.findByIdAndUpdate(
      doc._id,
      { state, country, city, address },
      { new: true }
    );

    return response({
      type: 'SUCCESS',
      code: 201,
      message: 'The billing document updated successfully',
      data: { state, country, city, address },
    });
  } catch (error) {
    return response({
      type: 'ERROR',
      code: 500,
      message: (error as Error).message,
    });
  }
};

export const deleteBilling = async ({ body }: Request, res: Response) => {
  const { userId } = body;
  const { response } = useResponse(res);

  try {
    // Find the billing document
    const doc = await Billing.findOne({ user: userId });
    if (!doc) throw new Error('Billing document not found');

    // Delete the billing document
    const deleteDoc = await Billing.findByIdAndDelete(doc.id);

    return response({
      type: 'SUCCESS',
      code: 200,
      message: 'Billing deleted successfully',
      data: deleteDoc,
    });
  } catch (error) {
    return response({
      type: 'ERROR',
      code: 500,
      message: (error as Error).message,
    });
  }
};
