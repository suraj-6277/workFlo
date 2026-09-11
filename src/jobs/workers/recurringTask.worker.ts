import { Worker, Job } from 'bullmq';
import { redisClient } from '../../config/redis';
import { Task } from '../../models/task.model';
import { Notification } from '../../models/notification.model';
import { logger } from '../../utils/logger';

export interface RecurringJobData {
  templateTaskId: string;
}

export const initRecurringTaskWorker = (): Worker<RecurringJobData> => {
  const worker = new Worker<RecurringJobData>(
    'recurring-tasks',
    async (job: Job<RecurringJobData>) => {
      const { templateTaskId } = job.data;
      logger.info(`🔄 Processing recurring task template ${templateTaskId}...`);

      const template = await Task.findById(templateTaskId);
      if (!template || !template.isRecurring || !template.recurrenceRule) {
        logger.warn(`Template task ${templateTaskId} is invalid or recurrence disabled.`);
        return;
      }

      const rule = template.recurrenceRule;

      // Check if past recurrence end date
      if (rule.endDate && new Date() > rule.endDate) {
        logger.info(`Template ${templateTaskId} has exceeded endDate. Disabling recurrence.`);
        template.isRecurring = false;
        await template.save();
        return;
      }

      // 1. Calculate new due date if original task had one
      let newDueDate: Date | undefined = undefined;
      if (template.dueDate) {
        newDueDate = new Date(template.dueDate);
        if (rule.frequency === 'daily') {
          newDueDate.setDate(newDueDate.getDate() + rule.interval);
        } else if (rule.frequency === 'weekly') {
          newDueDate.setDate(newDueDate.getDate() + rule.interval * 7);
        } else if (rule.frequency === 'monthly') {
          newDueDate.setMonth(newDueDate.getMonth() + rule.interval);
        }
      }

      // 2. Clone template into a fresh Task document
      const clonedTask = await Task.create({
        workspaceId: template.workspaceId,
        projectId: template.projectId,
        title: template.title,
        description: template.description,
        status: 'TODO',
        priority: template.priority,
        assignedTo: template.assignedTo,
        createdBy: template.createdBy,
        dueDate: newDueDate,
        isRecurring: false, // Instances are not recurring templates themselves
      });

      // 3. Update template run timestamps
      const nextDate = new Date();
      if (rule.frequency === 'daily') {
        nextDate.setDate(nextDate.getDate() + rule.interval);
      } else if (rule.frequency === 'weekly') {
        nextDate.setDate(nextDate.getDate() + rule.interval * 7);
      } else if (rule.frequency === 'monthly') {
        nextDate.setMonth(nextDate.getMonth() + rule.interval);
      }

      template.recurrenceRule.lastRunAt = new Date();
      template.recurrenceRule.nextRunAt = nextDate;
      await template.save();

      // 4. Notify creator
      await Notification.create({
        recipientId: template.createdBy,
        workspaceId: template.workspaceId,
        taskId: clonedTask._id,
        type: 'RECURRING_TASK_CREATED',
        title: 'Recurring Task Created',
        message: `A new task instance "${clonedTask.title}" was generated from your recurring template.`,
      });

      logger.info(`✅ Cloned new task ${clonedTask._id} from recurring template ${templateTaskId}`);
    },
    {
      connection: redisClient,
      concurrency: 5,
    },
  );

  worker.on('failed', (job, err) => {
    logger.error(`❌ Recurring task job failed for template ${job?.data?.templateTaskId}: ${err.message}`);
  });

  return worker;
};

