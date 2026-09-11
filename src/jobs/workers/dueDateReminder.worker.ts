import { Worker, Job } from 'bullmq';
import mongoose from 'mongoose';
import { redisClient } from '../../config/redis';
import { Task } from '../../models/task.model';
import { User } from '../../models/user.model';
import { Notification } from '../../models/notification.model';
import { EmailService } from '../../services/email.service';
import { logger } from '../../utils/logger';

export interface DueDateJobData {
  taskId: string;
  workspaceId: string;
  assignedToId: string;
}

export const initDueDateReminderWorker = (): Worker<DueDateJobData> => {
  const worker = new Worker<DueDateJobData>(
    'due-date-reminders',
    async (job: Job<DueDateJobData>) => {
      const { taskId, workspaceId, assignedToId } = job.data;
      logger.info(`🔔 Processing due-date reminder for task ${taskId}...`);

      // 1. Fetch Task
      const task = await Task.findById(taskId);
      if (!task) {
        logger.warn(`Task ${taskId} no longer exists; skipping reminder.`);
        return;
      }

      // If task is already completed, no reminder needed
      if (task.status === 'DONE') {
        logger.info(`Task ${taskId} is already marked DONE; skipping reminder.`);
        return;
      }

      // 2. Fetch Assignee
      const user = await User.findById(assignedToId);
      if (!user) {
        logger.warn(`Assignee ${assignedToId} not found; skipping reminder.`);
        return;
      }

      // 3. Idempotency Check: Prevent duplicate notifications if job was retried
      const existingNotification = await Notification.findOne({
        taskId: new mongoose.Types.ObjectId(taskId),
        recipientId: new mongoose.Types.ObjectId(assignedToId),
        type: 'DUE_DATE_REMINDER',
      });

      if (existingNotification) {
        logger.info(`Reminder notification already exists for task ${taskId}; skipping duplicate creation.`);
        return;
      }

      // 4. Create In-App Notification
      await Notification.create({
        recipientId: user._id,
        workspaceId: new mongoose.Types.ObjectId(workspaceId),
        taskId: task._id,
        type: 'DUE_DATE_REMINDER',
        title: 'Task Due Soon',
        message: `Task "${task.title}" is due soon. Please review and update its status.`,
      });

      // 5. Send Transactional Reminder Email
      await EmailService.sendEmail({
        to: user.email,
        subject: `Reminder: Task "${task.title}" is due soon`,
        body: `Hello ${user.name},\n\nYour task "${task.title}" is approaching its due date.`,
      });

      logger.info(`✅ Successfully delivered due-date reminder for task ${taskId} to ${user.email}`);
    },
    {
      connection: redisClient,
      concurrency: 5,
    },
  );

  worker.on('failed', (job, err) => {
    logger.error(`❌ Due date reminder job failed for task ${job?.data?.taskId}: ${err.message}`);
  });

  return worker;
};

