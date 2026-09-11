import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/roleGuard.middleware';
import { validate } from '../middlewares/validate.middleware';
import { Permission } from '../types/roles';
import { createProjectSchema, updateProjectSchema } from '../validations/project.validation';

// mergeParams: true allows inheriting :workspaceId from the parent workspace router
const router = Router({ mergeParams: true });

router.post(
  '/',
  requireAuth,
  requirePermission(Permission.PROJECT_CREATE),
  validate(createProjectSchema),
  ProjectController.createProject,
);

router.get(
  '/',
  requireAuth,
  requirePermission(Permission.PROJECT_VIEW),
  ProjectController.getWorkspaceProjects,
);

router.get(
  '/:projectId',
  requireAuth,
  requirePermission(Permission.PROJECT_VIEW),
  ProjectController.getProjectById,
);

router.patch(
  '/:projectId',
  requireAuth,
  requirePermission(Permission.PROJECT_UPDATE),
  validate(updateProjectSchema),
  ProjectController.updateProject,
);

router.delete(
  '/:projectId',
  requireAuth,
  requirePermission(Permission.PROJECT_DELETE),
  ProjectController.deleteProject,
);

export default router;

