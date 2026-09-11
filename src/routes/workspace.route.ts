import { Router } from 'express';
import { WorkspaceController } from '../controllers/workspace.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/roleGuard.middleware';
import { validate } from '../middlewares/validate.middleware';
import { Permission } from '../types/roles';
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  joinWorkspaceSchema,
  updateMemberRoleSchema,
} from '../validations/workspace.validation';
import projectRoutes from './project.route';
import taskRoutes from './task.route';

const router = Router();

// Nested resources: Projects and Tasks scoped to a workspace
router.use('/:workspaceId/projects', projectRoutes);
router.use('/:workspaceId/tasks', taskRoutes);

// Base routes (Authenticated user level)
router.post('/', requireAuth, validate(createWorkspaceSchema), WorkspaceController.createWorkspace);
router.get('/', requireAuth, WorkspaceController.getMyWorkspaces);
router.post('/join', requireAuth, validate(joinWorkspaceSchema), WorkspaceController.joinWorkspace);

// Workspace-scoped routes (Gated by declarative permissions)
router.get('/:id', requireAuth, WorkspaceController.getWorkspaceById);

router.patch(
  '/:id',
  requireAuth,
  requirePermission(Permission.WORKSPACE_UPDATE),
  validate(updateWorkspaceSchema),
  WorkspaceController.updateWorkspace,
);

router.delete(
  '/:id',
  requireAuth,
  requirePermission(Permission.WORKSPACE_DELETE),
  WorkspaceController.deleteWorkspace,
);

// Member management routes
router.get('/:id/members', requireAuth, WorkspaceController.getMembers);

router.patch(
  '/:id/members/:memberId',
  requireAuth,
  requirePermission(Permission.MEMBER_ROLE_UPDATE),
  validate(updateMemberRoleSchema),
  WorkspaceController.updateMemberRole,
);

router.delete(
  '/:id/members/:memberId',
  requireAuth,
  requirePermission(Permission.MEMBER_REMOVE),
  WorkspaceController.removeMember,
);

export default router;
