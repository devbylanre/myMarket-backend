import { Response } from 'express';

interface SuccessResponse<T> {
  res: Response;
  status: number;
  message: string;
  data: T;
}

interface ErrorResponse<T> {
  res: Response;
  status: number;
  message: T;
}

export const handleResponse = {
  success: <T extends unknown>({
    res,
    status,
    message,
    data,
  }: SuccessResponse<T>) => {
    return res
      .status(status)
      .json({ status: 'success', message: message, data: data, code: status });
  },

  error: <T extends unknown>({ res, status, message }: ErrorResponse<T>) => {
    return res
      .status(status)
      .json({ status: 'error', message: message, code: status });
  },
};
