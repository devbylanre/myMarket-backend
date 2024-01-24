import { Router } from 'express';
import { controller } from '../controllers/store.controller';

const storeRouter = Router();

storeRouter.post('/', controller.create);

storeRouter.get('/:reference/get', controller.get);

export default storeRouter;
