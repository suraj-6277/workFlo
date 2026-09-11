import Redis from 'ioredis';
import RedisMock from 'ioredis-mock';
import { env } from './env';
import { logger } from '../utils/logger';

const realRedis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true,
  connectTimeout: 2000,
  retryStrategy: () => null,
});

const mockRedis = new (RedisMock as unknown as typeof Redis)();
let useMock = false;

// Transparent proxy: commands go to real Redis if online, or in-memory mock if offline in development
export const redisClient = new Proxy(realRedis, {
  get(target, prop, receiver) {
    const active = useMock ? mockRedis : target;
    const value = Reflect.get(active, prop, receiver);
    if (typeof value === 'function') {
      return value.bind(active);
    }
    return value;
  },
}) as Redis;

export const connectRedis = async (): Promise<void> => {
  try {
    await realRedis.connect();
    logger.info('⚡ Real Redis connected successfully on port 6379');
  } catch (error) {
    if (env.NODE_ENV === 'development') {
      useMock = true;
      logger.warn('⚠️ Real Redis server not detected on localhost:6379.');
      logger.info('⚡ Switched seamlessly to in-memory Redis for local development & UI testing!');
      return;
    }
    logger.error('❌ Failed to connect to Redis:');
    logger.error(error);
    process.exit(1);
  }
};

export const disconnectRedis = async (): Promise<void> => {
  if (useMock) {
    await mockRedis.quit();
  } else {
    await realRedis.quit();
  }
  logger.info('⚡ Redis disconnected gracefully');
};
