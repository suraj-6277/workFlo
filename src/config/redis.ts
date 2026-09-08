import Redis from 'ioredis';
import { env } from './env';
import { logger } from '../utils/logger';

// BullMQ and connect-redis recommend `maxRetriesPerRequest: null` for blocking queue commands
export const redisClient = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true,
});

redisClient.on('connect', () => {
  logger.info('⚡ Redis connection initialized');
});

redisClient.on('ready', () => {
  logger.info('⚡ Redis is ready to accept commands');
});

redisClient.on('error', (err) => {
  logger.error(`❌ Redis error: ${err.message}`);
});

redisClient.on('close', () => {
  logger.warn('⚠️ Redis connection closed');
});

export const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
  } catch (error) {
    logger.error('❌ Failed to connect to Redis initially:');
    logger.error(error);
    process.exit(1);
  }
};

export const disconnectRedis = async (): Promise<void> => {
  await redisClient.quit();
  logger.info('⚡ Redis disconnected gracefully');
};

