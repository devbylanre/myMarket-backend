import { Router } from 'express';
import { useAuthorization } from '../middlewares/useAuthorization';
import { controller } from '../controllers/community.controller';

const communityRouter = Router();

const { authorize } = useAuthorization();

communityRouter.post('/:follower/add', authorize, controller.add);
communityRouter.post('/:follower/remove', authorize, controller.remove);
communityRouter.get('/followers', authorize, controller.followers);
communityRouter.get('/following', authorize, controller.following);

export default communityRouter;
