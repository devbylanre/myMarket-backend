import { Router } from 'express';
import {
  authenticateUser,
  createUser,
  destroy,
  refreshToken,
} from '../controllers/auth.controller';

const authRouter = Router();

authRouter.post('/', authenticateUser);
authRouter.post('/create', createUser);
authRouter.post('/token', refreshToken);
authRouter.post('/destroy', destroy);

export default authRouter;
