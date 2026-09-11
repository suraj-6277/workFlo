import mongoose, { Document, Schema } from 'mongoose';

export type NotificationType =
  | 'DUE_DATE_REMINDER'
  | 'TASK_ASSIGNED'
  | 'RECURRING_TASK_CREATED'
  | 'MEMBER_INVITED';

export interface INotification {
  recipientId: mongoose.Types.ObjectId;
  workspaceId: mongoose.Types.ObjectId;
  taskId?: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export interface INotificationDocument extends INotification, Document {}

const notificationSchema = new Schema<INotificationDocument>(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'recipientId is required'],
      index: true,
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: [true, 'workspaceId is required'],
      index: true,
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      default: undefined,
    },
    type: {
      type: String,
      enum: ['DUE_DATE_REMINDER', 'TASK_ASSIGNED', 'RECURRING_TASK_CREATED', 'MEMBER_INVITED'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret.__v;
        return ret;
      },
    },
  },
);

notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model<INotificationDocument>('Notification', notificationSchema);
