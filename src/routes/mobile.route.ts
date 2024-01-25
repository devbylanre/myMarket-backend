import { Router } from 'express';
import { controller } from '../controllers/mobile.controller';
import { useAuthorization } from '../middlewares/useAuth';

const mobileRouter = Router();

const { authorize } = useAuthorization();

mobileRouter.post('/', authorize, controller.create);
mobileRouter.get('/:reference/get', authorize, controller.get);
mobileRouter.delete('/:reference/delete', authorize, controller.delete);

export default mobileRouter;
