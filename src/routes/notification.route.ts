import { Router } from 'express';
import { useAuthorization } from '../middlewares/useAuthorization';
import { controller } from '../controllers/notification.controller';

const notificationRouter = Router();

const { authorize } = useAuthorization();

notificationRouter.post('/', authorize, controller.create);
notificationRouter.post('/:id/read', authorize, controller.read);
notificationRouter.get('/:reference/all', authorize, controller.get);
