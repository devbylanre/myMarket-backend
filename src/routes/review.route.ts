import { Router } from 'express';
import { useAuthorization } from '../middlewares/useAuth';
import { controller } from '../controllers/review.controller';

const reviewRouter = Router();

const { authorize } = useAuthorization();

reviewRouter.post('/', authorize, controller.create);
reviewRouter.delete('/:docId', authorize, controller.delete);
reviewRouter.get('/:productId', controller.get);

export default reviewRouter;
