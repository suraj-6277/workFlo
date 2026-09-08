import { Request, Response, NextFunction } from 'express';
import { AppError, FieldError } from '../utils/appError';
import { sendError } from '../utils/apiResponse';
import { logger } from '../utils/logger';
import { env } from '../config/env';

interface MongoError extends Error {
  code?: number;
  keyValue?: Record<string, unknown>;
  errors?: Record<string, { path: string; message: string }>;
}

export const errorHandler = (
  err: Error | AppError | MongoError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Operational AppError
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode, err.errors);
    return;
  }

  const mongoErr = err as MongoError;

  // MongoDB Duplicate Key Error (Code 11000)
  if (mongoErr.code === 11000 && mongoErr.keyValue) {
    const field = Object.keys(mongoErr.keyValue)[0];
    const message = `A record with this ${field} already exists.`;
    const errors: FieldError[] = [{ field, message }];
    sendError(res, message, 409, errors);
    return;
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError' && mongoErr.errors) {
    const errors: FieldError[] = Object.values(mongoErr.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    sendError(res, 'Validation failed', 400, errors);
    return;
  }

  // Unexpected Programmer or System Error
  logger.error(`💥 Unexpected Error: ${err.message}`);
  logger.error(err.stack || '');

  const clientMessage =
    env.NODE_ENV === 'production' ? 'Internal server error' : err.message || 'Internal server error';

  sendError(res, clientMessage, 500);
};

