import { dueDateReminderQueue, recurringTaskQueue } from '../queue';
import { isRealRedisAvailable } from '../../config/redis';
import { logger } from '../../utils/logger';
import { RecurrenceFrequency } from '../../models/task.model';

export class TaskScheduler {
  /**
   * Schedule a delayed due-date reminder job (defaults to 24h before due date)
   */
  public static async scheduleDueDateReminder(
    taskId: string,
    workspaceId: string,
    assignedToId: string,
    dueDate: Date,
  ): Promise<void> {
    try {
      if (!isRealRedisAvailable()) {
        logger.info(`⚡ [Dev/Mock] Due-date reminder registered in mock mode for task ${taskId}`);
        return;
      }

      const reminderTime = new Date(dueDate.getTime() - 24 * 60 * 60 * 1000);
      const delay = Math.max(0, reminderTime.getTime() - Date.now());
      const jobId = `reminder-${taskId}`;

      await dueDateReminderQueue.add(
        'send-reminder',
        { taskId, workspaceId, assignedToId },
        {
          jobId,
          delay,
          removeOnComplete: true,
        },
      );

      logger.info(`⏱️ Scheduled due-date reminder for task ${taskId} with delay of ${Math.round(delay / 1000)}s (JobId: ${jobId})`);
    } catch (err) {
      logger.warn(`Could not schedule reminder job for task ${taskId}: ${(err as Error).message}`);
    }
  }

  /**
   * Register a repeatable BullMQ job for a recurring task template
   */
  public static async registerRecurringTask(
    templateTaskId: string,
    frequency: RecurrenceFrequency,
    interval = 1,
  ): Promise<void> {
    try {
      if (!isRealRedisAvailable()) {
        logger.info(`⚡ [Dev/Mock] BullMQ recurring task registered in mock mode for template ${templateTaskId}`);
        return;
      }

      let everyMs = 24 * 60 * 60 * 1000 * interval; // default daily
      if (frequency === 'weekly') {
        everyMs = 7 * 24 * 60 * 60 * 1000 * interval;
      } else if (frequency === 'monthly') {
        everyMs = 30 * 24 * 60 * 60 * 1000 * interval;
      }

      const jobId = `recurring-${templateTaskId}`;

      await recurringTaskQueue.add(
        'clone-recurring-task',
        { templateTaskId },
        {
          jobId,
          repeat: {
            every: everyMs,
          },
        },
      );

      logger.info(`🔁 Registered repeatable recurring job for template ${templateTaskId} (Every ${everyMs}ms)`);
    } catch (err) {
      logger.warn(`Could not register recurring task ${templateTaskId}: ${(err as Error).message}`);
    }
  }

  /**
   * Cancel pending reminder job if task is deleted or marked DONE
   */
  public static async cancelReminderJob(taskId: string): Promise<void> {
    try {
      if (!isRealRedisAvailable()) {
        return;
      }

      const job = await dueDateReminderQueue.getJob(`reminder-${taskId}`);
      if (job) {
        await job.remove();
        logger.info(`🗑️ Cancelled reminder job for task ${taskId}`);
      }
    } catch (err) {
      logger.warn(`Could not cancel reminder job for task ${taskId}: ${(err as Error).message}`);
    }
  }
}

