import { Request, Response, NextFunction } from 'express';
import { useToken } from '../lib/useToken';
import { useResponse } from '../lib/useResponse';

export const useAuthorization = () => {
  const authorize = (req: Request, res: Response, next: NextFunction) => {
    const { verify } = useToken();
    const { response } = useResponse(res);

    try {
      const { headers } = req;
      // Get bearer token
      const token = headers.authorization?.split(' ')[1];

      // Check if token was not found
      if (!token) {
        return response({
          type: 'ERROR',
          code: 400,
          message: 'Authorization token is required',
        });
      }

      // Verify token
      const payload = verify(token);
      // Store token within request body
      req.body.userId = payload.id;

      // Go to next function
      next();
    } catch (error) {
      return response({
        type: 'ERROR',
        code: 500,
        message: (error as Error).message,
      });
    }
  };

  return { authorize };
};
