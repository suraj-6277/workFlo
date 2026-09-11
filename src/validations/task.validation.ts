import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const recurrenceRuleValidation = z.object({
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  interval: z.number().int().min(1).default(1),
  endDate: z.coerce.date().optional(),
});

export const createTaskSchema = z.object({
  body: z.object({
    projectId: z.string().regex(objectIdRegex, 'Invalid projectId format'),
    title: z.string().trim().min(2, 'Title must be at least 2 characters').max(200),
    description: z.string().max(2000).optional(),
    status: z.enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    assignedTo: z.string().regex(objectIdRegex, 'Invalid assignedTo user ID').optional(),
    dueDate: z.coerce.date().optional(),
    isRecurring: z.boolean().optional(),
    recurrenceRule: recurrenceRuleValidation.optional(),
  }),
});

export const updateTaskSchema = z.object({
  body: z.object({
    projectId: z.string().regex(objectIdRegex).optional(),
    title: z.string().trim().min(2).max(200).optional(),
    description: z.string().max(2000).optional(),
    status: z.enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    assignedTo: z.string().regex(objectIdRegex).nullable().optional(),
    dueDate: z.coerce.date().nullable().optional(),
    isRecurring: z.boolean().optional(),
    recurrenceRule: recurrenceRuleValidation.nullable().optional(),
  }),
});

export const queryTaskSchema = z.object({
  query: z.object({
    projectId: z.string().regex(objectIdRegex).optional(),
    status: z.enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    assignedTo: z.string().regex(objectIdRegex).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>['body'];
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>['body'];
export type QueryTaskInput = z.infer<typeof queryTaskSchema>['query'];

