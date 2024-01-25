import { Router } from 'express';
import { useAuthorization } from '../middlewares/useAuth';
import { controller } from '../controllers/community.controller';

const communityRoute = Router();

const { authorize } = useAuthorization();

communityRoute.post('/:follower/add', authorize, controller.add);
communityRoute.post('/:follower/remove', authorize, controller.remove);
communityRoute.get('/followers', authorize, controller.followers);
communityRoute.get('/following', authorize, controller.following);

export default communityRoute;
