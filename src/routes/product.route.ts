import { Router } from 'express';
import { controller } from '../controllers/product.controller';
import { useAuthorization } from '../middlewares/useAuth';
import { useUpload } from '../lib/useUpload';
import { useValidate } from '../lib/useValidate';
import Rules from '../validations/product.validation';

const productRouter = Router();

const { authorize } = useAuthorization();
const { validate } = useValidate();
const { configure } = useUpload();
const upload = configure({ fileSize: 1024 * 1024 * 2, files: 5 });

// Create product
productRouter.post('/', authorize, upload.array('images'), controller.create);

// Update product
productRouter.patch(
  '/:productId/update',
  authorize,
  validate(Rules.update),
  controller.update
);

// Get all products
productRouter.get('/', controller.getAll);

// Get a product
productRouter.get('/:productId/get', validate(Rules.getOne), controller.getOne);

// Delete a product
productRouter.delete(
  '/:productId/delete',
  authorize,
  validate(Rules.delete),
  controller.delete
);

// Get user products
productRouter.get(
  '/:userId',
  validate(Rules.getForUser),
  controller.getForUser
);

export default productRouter;
