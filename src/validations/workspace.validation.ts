import { z } from 'zod';
import { Role } from '../types/roles';

export const createWorkspaceSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Workspace name is required' })
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters'),
    description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  }),
});

export const updateWorkspaceSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100).optional(),
    description: z.string().max(500).optional(),
  }),
});

export const joinWorkspaceSchema = z.object({
  body: z.object({
    inviteCode: z.string({ required_error: 'Invite code is required' }).trim().min(6),
  }),
});

export const updateMemberRoleSchema = z.object({
  body: z.object({
    role: z.enum([Role.ADMIN, Role.MEMBER], {
      errorMap: () => ({ message: "Role must be 'ADMIN' or 'MEMBER'" }),
    }),
  }),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>['body'];
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>['body'];
export type JoinWorkspaceInput = z.infer<typeof joinWorkspaceSchema>['body'];
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>['body'];

