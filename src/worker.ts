import { env } from './config/env';
import { logger } from './utils/logger';

logger.info(`⚙️ Workflo Background Worker process initialized in ${env.NODE_ENV} mode`);
