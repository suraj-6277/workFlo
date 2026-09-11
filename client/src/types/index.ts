export interface User {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface Workspace {
  _id: string;
  name: string;
  description?: string;
  owner: string | User;
  inviteCode: string;
  currentUserRole?: 'OWNER' | 'ADMIN' | 'MEMBER';
}

export interface Project {
  _id: string;
  name: string;
  description?: string;
  color: string;
  workspaceId: string;
}

export type TaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  assignedTo?: User;
  projectId: string | Project;
  workspaceId: string;
  isRecurring?: boolean;
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

