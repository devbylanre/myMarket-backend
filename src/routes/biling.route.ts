import { Router } from 'express';
import { controller } from '../controllers/billing.controller';

const billingRouter = Router();

billingRouter.post('/', controller.create);

billingRouter.get('/:reference/get', controller.get);

billingRouter.delete('/:reference/delete', controller.delete);

export default billingRouter;
