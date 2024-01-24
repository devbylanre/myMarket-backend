import { Router } from 'express';
import { controller } from '../controllers/otp.controller';

const otpRouter = Router();

otpRouter.post('/', controller.create);

otpRouter.post('/:reference', controller.validate);

export default otpRouter;
