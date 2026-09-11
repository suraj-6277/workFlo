import { Queue } from 'bullmq';
import { redisClient } from '../config/redis';

// 1. Queue for delayed due-date reminder emails & in-app alerts
export const dueDateReminderQueue = new Queue('due-date-reminders', {
  connection: redisClient,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});

// 2. Queue for recurring task cloning & scheduling
export const recurringTaskQueue = new Queue('recurring-tasks', {
  connection: redisClient,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});
