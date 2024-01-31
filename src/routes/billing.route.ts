import { Router } from 'express';
import {
  createBilling,
  getBilling,
  updateBilling,
  deleteBilling,
} from '../controllers/billing.controller';
import { useAuthorization } from '../middlewares/useAuthorization';

const billingRouter = Router();

// Authorize requests
const { authorize } = useAuthorization();
billingRouter.use(authorize);

billingRouter.post('/', authorize, createBilling);
billingRouter.get('/', authorize, getBilling);
billingRouter.patch('/', updateBilling);
billingRouter.delete('/', authorize, deleteBilling);

export default billingRouter;
