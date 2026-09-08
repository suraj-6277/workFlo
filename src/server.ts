import express from 'express';
import { env } from './config/env';
import { logger } from './utils/logger';

const app = express();

app.use(express.json());

// Basic health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Workflo API server is running',
    timestamp: new Date().toISOString(),
  });
});

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 Workflo API server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
});

export default server;

