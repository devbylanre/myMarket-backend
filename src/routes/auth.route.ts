import { Router } from 'express';
import {
  authenticateUser,
  createUser,
  refreshToken,
} from '../controllers/auth.controller';

const authRouter = Router();

authRouter.post('/', authenticateUser);
authRouter.post('/create', createUser);
authRouter.post('/token', refreshToken);

export default authRouter;
