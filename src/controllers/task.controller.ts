import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/task.service';
import { sendSuccess } from '../utils/apiResponse';
import { QueryTaskInput } from '../validations/task.validation';

export class TaskController {
  public static async createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await TaskService.createTask(req.workspaceId!, req.user!._id, req.body);
      sendSuccess(res, 'Task created successfully', { task }, 201);
    } catch (error) {
      next(error);
    }
  }

  public static async getTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await TaskService.getTasks(
        req.workspaceId!,
        req.query as unknown as QueryTaskInput,
      );
      sendSuccess(res, 'Tasks retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  public static async getTaskById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await TaskService.getTaskById(req.params.taskId, req.workspaceId!);
      sendSuccess(res, 'Task details retrieved', { task });
    } catch (error) {
      next(error);
    }
  }

  public static async updateTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await TaskService.updateTask(req.params.taskId, req.workspaceId!, req.body);
      sendSuccess(res, 'Task updated successfully', { task });
    } catch (error) {
      next(error);
    }
  }

  public static async deleteTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await TaskService.deleteTask(req.params.taskId, req.workspaceId!);
      sendSuccess(res, 'Task deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  public static async getAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const analytics = await TaskService.getAnalytics(req.workspaceId!);
      sendSuccess(res, 'Task analytics computed successfully', { analytics });
    } catch (error) {
      next(error);
    }
  }
}
