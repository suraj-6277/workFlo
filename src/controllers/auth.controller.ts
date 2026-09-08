import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { AuthService } from '../services/auth.service';
import { sendSuccess } from '../utils/apiResponse';
import { AppError } from '../utils/appError';
import { IUserDocument } from '../models/user.model';

export class AuthController {
  /**
   * Register a new user and establish a session
   */
  public static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await AuthService.register(req.body);

      // Automatically log the newly registered user in
      req.login(user, (loginErr) => {
        if (loginErr) {
          next(loginErr);
          return;
        }

        sendSuccess(res, 'Registration successful', { user }, 201);
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Log in an existing user using Passport Local Strategy
   */
  public static login(req: Request, res: Response, next: NextFunction): void {
    passport.authenticate(
      'local',
      (err: Error | null, user: IUserDocument | false, info?: { message: string }) => {
        if (err) {
          next(err);
          return;
        }

        if (!user) {
          next(AppError.unauthorized(info?.message || 'Invalid email or password'));
          return;
        }

        req.login(user, (loginErr) => {
          if (loginErr) {
            next(loginErr);
            return;
          }

          sendSuccess(res, 'Login successful', { user });
        });
      },
    )(req, res, next);
  }

  /**
   * Log out current user and destroy server session & client cookie
   */
  public static logout(req: Request, res: Response, next: NextFunction): void {
    req.logout((err) => {
      if (err) {
        next(err);
        return;
      }

      req.session.destroy((destroyErr) => {
        if (destroyErr) {
          next(destroyErr);
          return;
        }

        res.clearCookie('connect.sid');
        sendSuccess(res, 'Logged out successfully');
      });
    });
  }

  /**
   * Get the profile of the currently logged-in user
   */
  public static getMe(req: Request, res: Response): void {
    sendSuccess(res, 'Current user profile fetched', { user: req.user });
  }

  /**
   * Handle Google OAuth Callback
   */
  public static googleCallback(req: Request, res: Response): void {
    // In production, redirect to frontend client URL (e.g. env.CORS_ORIGIN)
    sendSuccess(res, 'Google authentication successful', { user: req.user });
  }
}

