import mongoose from 'mongoose';
import { Notification, INotificationDocument, NotificationType } from '../models/notification.model';
import { AppError } from '../utils/appError';

export class NotificationService {
  /**
   * Create an in-app notification
   */
  public static async createNotification(
    recipientId: mongoose.Types.ObjectId,
    workspaceId: mongoose.Types.ObjectId,
    type: NotificationType,
    title: string,
    message: string,
    taskId?: mongoose.Types.ObjectId,
  ): Promise<INotificationDocument> {
    return Notification.create({
      recipientId,
      workspaceId,
      taskId,
      type,
      title,
      message,
      isRead: false,
    });
  }

  /**
   * Get user's notifications sorted newest first
   */
  public static async getUserNotifications(
    recipientId: mongoose.Types.ObjectId,
    limit = 50,
  ): Promise<INotificationDocument[]> {
    return Notification.find({ recipientId })
      .populate('taskId', 'title status dueDate')
      .populate('workspaceId', 'name')
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  /**
   * Mark a single notification as read
   */
  public static async markAsRead(
    notificationId: string,
    recipientId: mongoose.Types.ObjectId,
  ): Promise<INotificationDocument> {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipientId },
      { isRead: true },
      { new: true },
    );

    if (!notification) {
      throw AppError.notFound('Notification not found');
    }

    return notification;
  }

  /**
   * Mark all notifications as read for current user
   */
  public static async markAllAsRead(recipientId: mongoose.Types.ObjectId): Promise<void> {
    await Notification.updateMany({ recipientId, isRead: false }, { isRead: true });
  }
}
