import { Router } from 'express';
import { controller } from '../controllers/billing.controller';
import { useAuthorization } from '../middlewares/useAuth';

const billingRouter = Router();

const { authorize } = useAuthorization();

billingRouter.post('/', authorize, controller.create);

billingRouter.get('/:reference/get', authorize, controller.get);

billingRouter.delete('/:reference/delete', authorize, controller.delete);

export default billingRouter;
