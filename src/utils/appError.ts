export interface FieldError {
  field?: string;
  message: string;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors?: FieldError[];

  constructor(message: string, statusCode = 500, errors?: FieldError[], isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad Request', errors?: FieldError[]): AppError {
    return new AppError(message, 400, errors);
  }

  static unauthorized(message = 'Unauthorized access'): AppError {
    return new AppError(message, 401);
  }

  static forbidden(message = 'You do not have permission to perform this action'): AppError {
    return new AppError(message, 403);
  }

  static notFound(message = 'Resource not found'): AppError {
    return new AppError(message, 404);
  }

  static conflict(message = 'Resource already exists'): AppError {
    return new AppError(message, 409);
  }

  static internal(message = 'Internal server error'): AppError {
    return new AppError(message, 500, undefined, false);
  }
}

