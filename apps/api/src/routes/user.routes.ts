import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { getMe, updateMe, saveProperty, unsaveProperty, getSaved, addAlert, deleteAlert } from '../controllers/user.controller';

export const userRouter = Router();

userRouter.use(requireAuth);

userRouter.get('/me', getMe);
userRouter.patch('/me', updateMe);
userRouter.get('/me/saved', getSaved);
userRouter.post('/me/saved/:propertyId', saveProperty);
userRouter.delete('/me/saved/:propertyId', unsaveProperty);
userRouter.post('/me/alerts', addAlert);
userRouter.delete('/me/alerts/:alertId', deleteAlert);
