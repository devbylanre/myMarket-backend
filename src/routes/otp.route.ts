import { NextFunction, Request, Response, Router } from 'express';
import { controller } from '../controllers/otp.controller';
import { useValidate } from '../lib/useValidate';
import { createRoute, validateRoute } from '../validations/otp.validation';
import { useAuthorization } from '../middlewares/useAuth';

const otpRouter = Router();

const { validate } = useValidate();
const { authorize } = useAuthorization();

otpRouter.post('/', authorize, validate(createRoute), controller.create);

otpRouter.post(
  '/:reference/validate',
  authorize,
  validate(validateRoute),
  controller.validate
);

export default otpRouter;
