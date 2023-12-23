import { Response } from 'express';

interface ISuccessResponse {
  res: Response;
  status: number;
  message: Record<string, any>[] | string;
  data: Record<string, any> | null;
}

interface IErrorResponse {
  res: Response;
  status: number;
  message: Record<string, any>[] | string;
}

export const handleResponse = {
  success: ({ res, status, message, data }: ISuccessResponse) => {
    return res.status(status).json({ message: message, data: data });
  },

  error: ({ res, status, message }: IErrorResponse) => {
    return res.status(status).json({ message: message });
  },
};
