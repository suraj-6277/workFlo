import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', requireAuth, NotificationController.getMyNotifications);
router.post('/test', requireAuth, NotificationController.triggerTestNotification);
router.patch('/read-all', requireAuth, NotificationController.markAllAsRead);
router.patch('/:id/read', requireAuth, NotificationController.markAsRead);

export default router;

