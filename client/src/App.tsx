import { useState, useEffect } from 'react';
import { User, Workspace, Project, Task, Notification, TaskStatus } from './types';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { KanbanBoard } from './components/KanbanBoard';
import { AuthModal } from './components/AuthModal';
import { CreateTaskModal } from './components/CreateTaskModal';
import { CreateWorkspaceModal } from './components/CreateWorkspaceModal';

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Workspaces state
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | undefined>();

  // Projects state
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('');

  // Tasks state
  const [tasks, setTasks] = useState<Task[]>([]);

  // Notifications state
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);

  // 1. Initial Auth Check & Unauthorized Session Expiration Listener
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { user } = await api.getMe();
        setUser(user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();

    const handleUnauthorized = () => {
      setUser(null);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  // 2. Load Workspaces when user logs in
  useEffect(() => {
    if (!user) return;

    const loadWorkspaces = async () => {
      try {
        const { workspaces } = await api.getWorkspaces();
        setWorkspaces(workspaces);
        if (workspaces.length > 0 && !activeWorkspace) {
          setActiveWorkspace(workspaces[0]);
        }
      } catch (err) {
        console.error('Failed to load workspaces:', err);
      }
    };

    loadWorkspaces();
  }, [user]);

  // 3. Load Projects, Tasks & Notifications when Active Workspace changes
  useEffect(() => {
    if (!activeWorkspace) {
      setProjects([]);
      setTasks([]);
      return;
    }

    const loadWorkspaceData = async () => {
      try {
        const [projRes, taskRes, notifRes] = await Promise.all([
          api.getProjects(activeWorkspace._id),
          api.getTasks(activeWorkspace._id, activeProjectId || undefined),
          api.getNotifications(),
        ]);

        setProjects(projRes.projects);
        setTasks(taskRes.tasks);
        setNotifications(notifRes.notifications);
      } catch (err) {
        console.error('Failed to load workspace data:', err);
      }
    };

    loadWorkspaceData();
  }, [activeWorkspace, activeProjectId]);

  // Handle task status change (e.g. from TODO to IN_PROGRESS or DONE)
  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    if (!activeWorkspace) return;

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t)),
    );

    try {
      await api.updateTaskStatus(activeWorkspace._id, taskId, newStatus);
    } catch (err) {
      console.error('Failed to update task status:', err);
      // Re-fetch on failure
      const { tasks } = await api.getTasks(activeWorkspace._id, activeProjectId || undefined);
      setTasks(tasks);
    }
  };

  // Handle task delete
  const handleDeleteTask = async (taskId: string) => {
    if (!activeWorkspace) return;
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
    try {
      await api.deleteTask(activeWorkspace._id, taskId);
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  // Handle project create
  const handleCreateProject = async (name: string, color: string) => {
    if (!activeWorkspace) return;
    try {
      const { project } = await api.createProject(activeWorkspace._id, { name, color });
      setProjects((prev) => [project, ...prev]);
      setActiveProjectId(project._id);
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore
    }
    setUser(null);
    setWorkspaces([]);
    setActiveWorkspace(undefined);
    setProjects([]);
    setTasks([]);
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#090d16', color: '#818cf8', fontWeight: 600 }}>
        Loading Workflo...
      </div>
    );
  }

  if (!user) {
    return <AuthModal onSuccess={(loggedInUser) => setUser(loggedInUser)} />;
  }

  return (
    <div className="app-container">
      {/* Sidebar */}
      <Sidebar
        workspaces={workspaces}
        activeWorkspace={activeWorkspace}
        onSelectWorkspace={(ws) => {
          setActiveWorkspace(ws);
          setActiveProjectId('');
        }}
        onOpenNewWorkspace={() => setIsWorkspaceModalOpen(true)}
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={(projId) => setActiveProjectId(projId)}
        onCreateProject={handleCreateProject}
      />

      {/* Main Content Area */}
      <main className="main-content">
        <Navbar
          user={user}
          activeWorkspace={activeWorkspace}
          notifications={notifications}
          onOpenCreateTask={() => setIsTaskModalOpen(true)}
          onLogout={handleLogout}
          onRefreshNotifications={async () => {
            const { notifications } = await api.getNotifications();
            setNotifications(notifications);
          }}
        />

        {workspaces.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
            <h3 style={{ fontSize: 18, color: '#fff', marginBottom: 8 }}>No Workspaces Yet</h3>
            <p style={{ fontSize: 13, marginBottom: 16 }}>Create or join your first workspace to start collaborating.</p>
            <button className="btn btn-primary" onClick={() => setIsWorkspaceModalOpen(true)}>
              Create Workspace
            </button>
          </div>
        ) : (
          <KanbanBoard
            tasks={tasks}
            onStatusChange={handleStatusChange}
            onDeleteTask={handleDeleteTask}
            onOpenCreateModal={() => setIsTaskModalOpen(true)}
          />
        )}
      </main>

      {/* Modals */}
      {isTaskModalOpen && activeWorkspace && (
        <CreateTaskModal
          workspaceId={activeWorkspace._id}
          projects={projects}
          activeProjectId={activeProjectId}
          onClose={() => setIsTaskModalOpen(false)}
          onTaskCreated={(newTask) => setTasks((prev) => [newTask, ...prev])}
        />
      )}

      {isWorkspaceModalOpen && (
        <CreateWorkspaceModal
          onClose={() => setIsWorkspaceModalOpen(false)}
          onWorkspaceCreated={(newWs) => {
            setWorkspaces((prev) => [newWs, ...prev]);
            setActiveWorkspace(newWs);
          }}
        />
      )}
    </div>
  );
}

export default App;
