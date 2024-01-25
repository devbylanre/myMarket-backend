import { Router } from 'express';
import { controller } from '../controllers/token.controller';

const tokenRouter = Router();

tokenRouter.post('/', controller.confirm);
tokenRouter.post('/resend', controller.resend);

export default tokenRouter;
