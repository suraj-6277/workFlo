import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Permission, hasPermission } from '../types/roles';
import { Member } from '../models/member.model';
import { AppError } from '../utils/appError';

export const requirePermission = (requiredPermission: Permission) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        next(AppError.unauthorized('Authentication required'));
        return;
      }

      // Resolve workspaceId from path params, body, query, or custom header
      const workspaceId =
        req.params.workspaceId ||
        req.params.id ||
        req.body.workspaceId ||
        (req.query.workspaceId as string) ||
        (req.headers['x-workspace-id'] as string);

      if (!workspaceId) {
        next(AppError.badRequest('Workspace ID is required for this operation'));
        return;
      }

      if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
        next(AppError.badRequest('Invalid workspace ID format'));
        return;
      }

      // Check membership in workspace
      const member = await Member.findOne({
        workspaceId,
        userId: req.user._id,
      });

      if (!member) {
        next(AppError.forbidden('You are not a member of this workspace'));
        return;
      }

      // Check permissions against our declarative single source of truth matrix
      if (!hasPermission(member.role, requiredPermission)) {
        next(AppError.forbidden(`Forbidden: Role '${member.role}' lacks permission '${requiredPermission}'`));
        return;
      }

      // Attach member context for downstream controllers
      req.member = member;
      req.workspaceId = workspaceId;

      next();
    } catch (error) {
      next(error);
    }
  };
};

