import express from 'express';
import session from 'express-session';
import { RedisStore } from 'connect-redis';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import passport from './config/passport';
import { env } from './config/env';
import { logger } from './utils/logger';
import { connectDatabase } from './config/database';
import { connectRedis, redisClient } from './config/redis';
import authRoutes from './routes/auth.route';
import { errorHandler } from './middlewares/error.middleware';
import { AppError } from './utils/appError';

const app = express();

// Security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false, // allow inline scripts for local dev testbench
  }),
);

// CORS configuration
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);

// Body and Cookie Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static interactive dev testbench
app.use(express.static('public'));

// Initialize Redis Session Store
const redisStore = new RedisStore({
  client: redisClient,
  prefix: 'workflo:sess:',
});

// Configure Session Middleware
app.use(
  session({
    store: redisStore,
    name: 'connect.sid',
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  }),
);

// Initialize Passport Authentication
app.use(passport.initialize());
app.use(passport.session());

// Health Check Endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Workflo API is healthy and operational',
    timestamp: new Date().toISOString(),
  });
});

// Mount Feature Routes
app.use('/api/v1/auth', authRoutes);

// Catch-all for undefined routes
app.all('*', (req, _res, next) => {
  next(AppError.notFound(`Cannot find ${req.method} ${req.originalUrl} on this server`));
});

// Global Centralized Error Handler
app.use(errorHandler);

// Boot function to connect services before listening
const startServer = async (): Promise<void> => {
  await connectDatabase();
  await connectRedis();

  app.listen(env.PORT, () => {
    logger.info(`🚀 Workflo API server listening on http://localhost:${env.PORT} in ${env.NODE_ENV} mode`);
    logger.info(`🌐 Interactive Dev Web Testbench is live at: http://localhost:${env.PORT}`);
  });
};

// Start the server only if run directly
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
