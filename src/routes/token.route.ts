import { Router } from 'express';
import { useValidate } from '../lib/useValidate';
import Rules from '../validations/token';
import { resendToken, verifyToken } from '../controllers/token.controller';

const tokenRouter = Router();

const { validate } = useValidate();

tokenRouter.post('/', validate(Rules.confirm), verifyToken);
tokenRouter.post('/resend', validate(Rules.resend), resendToken);

export default tokenRouter;
