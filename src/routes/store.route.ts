import { Router } from 'express';
import { controller } from '../controllers/store.controller';
import { useAuthorization } from '../middlewares/useAuth';

const storeRouter = Router();
const { authorize } = useAuthorization();

storeRouter.post('/', authorize, controller.create);

storeRouter.get('/:reference/get', authorize, controller.get);

export default storeRouter;
