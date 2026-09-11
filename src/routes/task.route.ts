import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/roleGuard.middleware';
import { validate } from '../middlewares/validate.middleware';
import { Permission } from '../types/roles';
import { createTaskSchema, updateTaskSchema, queryTaskSchema } from '../validations/task.validation';

const router = Router({ mergeParams: true });

router.post(
  '/',
  requireAuth,
  requirePermission(Permission.TASK_CREATE),
  validate(createTaskSchema),
  TaskController.createTask,
);

router.get(
  '/',
  requireAuth,
  requirePermission(Permission.TASK_VIEW),
  validate(queryTaskSchema),
  TaskController.getTasks,
);

router.get(
  '/analytics',
  requireAuth,
  requirePermission(Permission.TASK_VIEW),
  TaskController.getAnalytics,
);

router.get(
  '/:taskId',
  requireAuth,
  requirePermission(Permission.TASK_VIEW),
  TaskController.getTaskById,
);

router.patch(
  '/:taskId',
  requireAuth,
  requirePermission(Permission.TASK_UPDATE),
  validate(updateTaskSchema),
  TaskController.updateTask,
);

router.delete(
  '/:taskId',
  requireAuth,
  requirePermission(Permission.TASK_DELETE),
  TaskController.deleteTask,
);

export default router;

