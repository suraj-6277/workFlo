import { Response } from 'express';
import { FieldError } from './appError';

export interface ApiResponsePayload<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: FieldError[];
}

export const sendSuccess = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode = 200,
): Response => {
  const payload: ApiResponsePayload<T> = {
    success: true,
    message,
    ...(data !== undefined && { data }),
  };

  return res.status(statusCode).json(payload);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
  errors?: FieldError[],
): Response => {
  const payload: ApiResponsePayload = {
    success: false,
    message,
    ...(errors && errors.length > 0 && { errors }),
  };

  return res.status(statusCode).json(payload);
};

