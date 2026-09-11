import { Request, Response, NextFunction } from 'express';
import { WorkspaceService } from '../services/workspace.service';
import { sendSuccess } from '../utils/apiResponse';

export class WorkspaceController {
  public static async createWorkspace(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await WorkspaceService.createWorkspace(req.user!._id, req.body);
      sendSuccess(res, 'Workspace created successfully', result, 201);
    } catch (error) {
      next(error);
    }
  }

  public static async getMyWorkspaces(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaces = await WorkspaceService.getUserWorkspaces(req.user!._id);
      sendSuccess(res, 'Workspaces retrieved successfully', { workspaces });
    } catch (error) {
      next(error);
    }
  }

  public static async getWorkspaceById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspace = await WorkspaceService.getWorkspaceById(req.params.id);
      sendSuccess(res, 'Workspace details retrieved', { workspace });
    } catch (error) {
      next(error);
    }
  }

  public static async updateWorkspace(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspace = await WorkspaceService.updateWorkspace(req.params.id, req.body);
      sendSuccess(res, 'Workspace updated successfully', { workspace });
    } catch (error) {
      next(error);
    }
  }

  public static async deleteWorkspace(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await WorkspaceService.deleteWorkspace(req.params.id);
      sendSuccess(res, 'Workspace deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  public static async joinWorkspace(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await WorkspaceService.joinByInviteCode(req.user!._id, req.body.inviteCode);
      sendSuccess(res, 'Joined workspace successfully', result);
    } catch (error) {
      next(error);
    }
  }

  public static async getMembers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const members = await WorkspaceService.getWorkspaceMembers(req.params.id);
      sendSuccess(res, 'Workspace members retrieved', { members });
    } catch (error) {
      next(error);
    }
  }

  public static async updateMemberRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const member = await WorkspaceService.updateMemberRole(
        req.params.id,
        req.params.memberId,
        req.body.role,
      );
      sendSuccess(res, 'Member role updated successfully', { member });
    } catch (error) {
      next(error);
    }
  }

  public static async removeMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await WorkspaceService.removeMember(req.params.id, req.params.memberId);
      sendSuccess(res, 'Member removed from workspace successfully');
    } catch (error) {
      next(error);
    }
  }
}

