import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';

export const requireAuth = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.isAuthenticated() && req.user) {
    next();
    return;
  }

  next(AppError.unauthorized('Please log in to access this resource'));
};

