import { Request, Response, NextFunction } from 'express';
import { ProjectService } from '../services/project.service';
import { sendSuccess } from '../utils/apiResponse';

export class ProjectController {
  public static async createProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const project = await ProjectService.createProject(req.workspaceId!, req.body);
      sendSuccess(res, 'Project created successfully', { project }, 201);
    } catch (error) {
      next(error);
    }
  }

  public static async getWorkspaceProjects(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const projects = await ProjectService.getWorkspaceProjects(req.workspaceId!);
      sendSuccess(res, 'Projects retrieved successfully', { projects });
    } catch (error) {
      next(error);
    }
  }

  public static async getProjectById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const project = await ProjectService.getProjectById(req.params.projectId, req.workspaceId!);
      sendSuccess(res, 'Project details retrieved', { project });
    } catch (error) {
      next(error);
    }
  }

  public static async updateProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const project = await ProjectService.updateProject(
        req.params.projectId,
        req.workspaceId!,
        req.body,
      );
      sendSuccess(res, 'Project updated successfully', { project });
    } catch (error) {
      next(error);
    }
  }

  public static async deleteProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await ProjectService.deleteProject(req.params.projectId, req.workspaceId!);
      sendSuccess(res, 'Project deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

