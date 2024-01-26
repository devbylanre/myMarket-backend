import { Router } from 'express';
import { controller } from '../controllers/token.controller';
import { useValidate } from '../lib/useValidate';
import Rules from '../validations/token';

const tokenRouter = Router();

const { validate } = useValidate();

tokenRouter.post('/', validate(Rules.confirm), controller.confirm);
tokenRouter.post('/resend', validate(Rules.resend), controller.resend);

export default tokenRouter;
