import { Router } from 'express';
import { controller } from '../controllers/pin.controller';
import { useAuthorization } from '../middlewares/useAuthorization';

const pinRouter = Router();

const { authorize } = useAuthorization();

pinRouter.post('/', authorize, controller.add);
pinRouter.get('/:pinnedBy/get', authorize, controller.get);
pinRouter.post('/:product/remove', authorize, controller.remove);

export default pinRouter;
