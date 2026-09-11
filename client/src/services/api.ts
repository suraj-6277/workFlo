import { User, Workspace, Project, Task, Notification, TaskStatus } from '../types';

const API_BASE = '/api/v1';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // essential for session cookie
  });

  const json = await res.json();
  if (!res.ok) {
    const errorMsg = json.errors?.[0]?.message || json.message || 'Request failed';
    throw new Error(errorMsg);
  }

  return json.data;
}

export const api = {
  // Auth
  register: (data: { name: string; email: string; password: string }) =>
    request<{ user: User }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    request<{ user: User }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  logout: () =>
    request<void>('/auth/logout', { method: 'POST' }),

  getMe: () =>
    request<{ user: User }>('/auth/me'),

  // Workspaces
  getWorkspaces: () =>
    request<{ workspaces: Workspace[] }>('/workspaces'),

  createWorkspace: (data: { name: string; description?: string }) =>
    request<{ workspace: Workspace }>('/workspaces', { method: 'POST', body: JSON.stringify(data) }),

  joinWorkspace: (inviteCode: string) =>
    request<{ workspace: Workspace }>('/workspaces/join', {
      method: 'POST',
      body: JSON.stringify({ inviteCode }),
    }),

  // Projects
  getProjects: (workspaceId: string) =>
    request<{ projects: Project[] }>(`/workspaces/${workspaceId}/projects`),

  createProject: (workspaceId: string, data: { name: string; color?: string }) =>
    request<{ project: Project }>(`/workspaces/${workspaceId}/projects`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Tasks
  getTasks: (workspaceId: string, projectId?: string) =>
    request<{ tasks: Task[] }>(
      `/workspaces/${workspaceId}/tasks${projectId ? `?projectId=${projectId}` : ''}`,
    ),

  createTask: (
    workspaceId: string,
    data: {
      projectId: string;
      title: string;
      description?: string;
      priority?: string;
      dueDate?: string;
      isRecurring?: boolean;
    },
  ) =>
    request<{ task: Task }>(`/workspaces/${workspaceId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateTaskStatus: (workspaceId: string, taskId: string, status: TaskStatus) =>
    request<{ task: Task }>(`/workspaces/${workspaceId}/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  deleteTask: (workspaceId: string, taskId: string) =>
    request<void>(`/workspaces/${workspaceId}/tasks/${taskId}`, { method: 'DELETE' }),

  // Notifications
  getNotifications: () =>
    request<{ notifications: Notification[] }>('/notifications'),

  markAllNotificationsRead: () =>
    request<void>('/notifications/read-all', { method: 'PATCH' }),
};
