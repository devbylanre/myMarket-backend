import { Router } from 'express';
import { controller } from '../controllers/mobile.controller';

const mobileRouter = Router();

mobileRouter.post('/', controller.create);
mobileRouter.get('/:reference/get', controller.get);
mobileRouter.delete('/:reference/delete', controller.delete);

export default mobileRouter;
