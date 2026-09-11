import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';
import { sendSuccess } from '../utils/apiResponse';

export class NotificationController {
  public static async getMyNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const notifications = await NotificationService.getUserNotifications(req.user!._id);
      sendSuccess(res, 'Notifications retrieved successfully', { notifications });
    } catch (error) {
      next(error);
    }
  }

  public static async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const notification = await NotificationService.markAsRead(req.params.id, req.user!._id);
      sendSuccess(res, 'Notification marked as read', { notification });
    } catch (error) {
      next(error);
    }
  }

  public static async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await NotificationService.markAllAsRead(req.user!._id);
      sendSuccess(res, 'All notifications marked as read');
    } catch (error) {
      next(error);
    }
  }
}
