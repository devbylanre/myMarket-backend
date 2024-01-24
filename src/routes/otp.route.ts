import { Router } from 'express';
import { controller } from '../controllers/otp.controller';
import { useValidate } from '../lib/useValidate';
import { createRoute, validateRoute } from '../validations/otp.validation';

const otpRouter = Router();

const { validate } = useValidate();

otpRouter.post('/', validate(createRoute), controller.create);

otpRouter.post(
  '/:reference/validate',
  validate(validateRoute),
  controller.validate
);

export default otpRouter;
