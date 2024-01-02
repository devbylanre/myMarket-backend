import { Response } from 'express';

interface ISuccessResponse {
  res: Response;
  status: number;
  message: Record<string, any>[] | string;
  data: Record<string, any> | Record<string, any>[] | null;
}

interface IErrorResponse {
  res: Response;
  status: number;
  message: Record<string, any>[] | string;
}

export const handleResponse = {
  success: ({ res, status, message, data }: ISuccessResponse) => {
    return res
      .status(status)
      .json({ status: 'success', message: message, data: data, code: status });
  },

  error: ({ res, status, message }: IErrorResponse) => {
    return res
      .status(status)
      .json({ status: 'error', message: message, code: status });
  },
};
