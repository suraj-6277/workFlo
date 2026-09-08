import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AppError, FieldError } from '../utils/appError';

export const validate =
  (schema: AnyZodObject) =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Replace with sanitized/coerced data
      req.body = parsed.body;
      req.query = parsed.query;
      req.params = parsed.params;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: FieldError[] = error.errors.map((err) => ({
          field: err.path.slice(1).join('.') || err.path.join('.'),
          message: err.message,
        }));

        next(AppError.badRequest('Validation failed', fieldErrors));
        return;
      }

      next(error);
    }
  };

