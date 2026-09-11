import { env } from './config/env';
import { logger } from './utils/logger';
import { connectDatabase, disconnectDatabase } from './config/database';
import { connectRedis, disconnectRedis } from './config/redis';
import { initDueDateReminderWorker } from './jobs/workers/dueDateReminder.worker';
import { initRecurringTaskWorker } from './jobs/workers/recurringTask.worker';

const startWorker = async (): Promise<void> => {
  logger.info(`⚙️ Starting Workflo Background Worker process in ${env.NODE_ENV} mode...`);

  await connectDatabase();
  await connectRedis();

  const reminderWorker = initDueDateReminderWorker();
  const recurringWorker = initRecurringTaskWorker();

  logger.info('🚀 All BullMQ workers initialized and actively listening for jobs');

  // Graceful shutdown handling
  const shutdown = async (signal: string) => {
    logger.warn(`🛑 Received ${signal}. Closing workers and database connections gracefully...`);
    await reminderWorker.close();
    await recurringWorker.close();
    await disconnectRedis();
    await disconnectDatabase();
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

startWorker();
