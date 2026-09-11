import { useState, useEffect } from 'react';
import { User, Workspace, Project, Task, Notification, TaskStatus } from './types';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { KanbanBoard } from './components/KanbanBoard';
import { AuthModal } from './components/AuthModal';
import { CreateTaskModal } from './components/CreateTaskModal';
import { CreateWorkspaceModal } from './components/CreateWorkspaceModal';
import { MetricsBanner } from './components/MetricsBanner';
import { TaskFilterBar } from './components/TaskFilterBar';
import { ToastContainer, ToastMessage } from './components/Toast';

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

  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('ALL');

  // Notifications state
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);

  // Mobile sidebar state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Toast notifications state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

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
      showToast('Session expired. Please sign in again.', 'error');
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

    const statusNames: Record<TaskStatus, string> = {
      BACKLOG: 'Backlog',
      TODO: 'To Do',
      IN_PROGRESS: 'In Progress',
      IN_REVIEW: 'In Review',
      DONE: 'Completed',
    };

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t)),
    );
    showToast(`Task moved to ${statusNames[newStatus]}`, 'info');

    try {
      await api.updateTaskStatus(activeWorkspace._id, taskId, newStatus);
    } catch (err) {
      console.error('Failed to update task status:', err);
      showToast('Could not update status. Reverting...', 'error');
      // Re-fetch on failure
      const { tasks } = await api.getTasks(activeWorkspace._id, activeProjectId || undefined);
      setTasks(tasks);
    }
  };

  // Handle task delete
  const handleDeleteTask = async (taskId: string) => {
    if (!activeWorkspace) return;
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
    showToast('Task deleted', 'info');
    try {
      await api.deleteTask(activeWorkspace._id, taskId);
    } catch (err) {
      console.error('Failed to delete task:', err);
      showToast('Failed to delete task from server', 'error');
    }
  };

  // Handle project create
  const handleCreateProject = async (name: string, color: string) => {
    if (!activeWorkspace) return;
    try {
      const { project } = await api.createProject(activeWorkspace._id, { name, color });
      setProjects((prev) => [project, ...prev]);
      setActiveProjectId(project._id);
      showToast(`Project "${project.name}" created!`, 'success');
    } catch (err) {
      console.error('Failed to create project:', err);
      showToast('Failed to create project', 'error');
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
    showToast('Logged out successfully', 'info');
  };

  // Compute filtered tasks for Kanban board display
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPriority =
      selectedPriority === 'ALL' || t.priority === selectedPriority;

    return matchesSearch && matchesPriority;
  });

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
      {/* Toast Notification Layer */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* Sidebar (with mobile drawer support) */}
      <Sidebar
        workspaces={workspaces}
        activeWorkspace={activeWorkspace}
        onSelectWorkspace={(ws) => {
          setActiveWorkspace(ws);
          setActiveProjectId('');
          setSearchQuery('');
        }}
        onOpenNewWorkspace={() => setIsWorkspaceModalOpen(true)}
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={(projId) => {
          setActiveProjectId(projId);
          setSearchQuery('');
        }}
        onCreateProject={handleCreateProject}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onCopyFeedback={(msg) => showToast(msg, 'success')}
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
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        {workspaces.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', padding: 24 }}>
            <h3 style={{ fontSize: 18, color: '#fff', marginBottom: 8 }}>No Workspaces Yet</h3>
            <p style={{ fontSize: 13, marginBottom: 16, textAlign: 'center' }}>
              Create or join your first workspace to start collaborating.
            </p>
            <button className="btn btn-primary" onClick={() => setIsWorkspaceModalOpen(true)}>
              Create Workspace
            </button>
          </div>
        ) : (
          <div className="dashboard-scrollable-body">
            {/* Live Metrics Overview Banner */}
            <MetricsBanner tasks={tasks} />

            {/* Instant Search & Priority Filter Toolbar */}
            <TaskFilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedPriority={selectedPriority}
              onPriorityChange={setSelectedPriority}
              totalFiltered={filteredTasks.length}
              totalTasks={tasks.length}
            />

            {/* Interactive Kanban Board */}
            <KanbanBoard
              tasks={filteredTasks}
              onStatusChange={handleStatusChange}
              onDeleteTask={handleDeleteTask}
              onOpenCreateModal={() => setIsTaskModalOpen(true)}
            />
          </div>
        )}
      </main>

      {/* Modals */}
      {isTaskModalOpen && activeWorkspace && (
        <CreateTaskModal
          workspaceId={activeWorkspace._id}
          projects={projects}
          activeProjectId={activeProjectId}
          onClose={() => setIsTaskModalOpen(false)}
          onTaskCreated={(newTask) => {
            setTasks((prev) => [newTask, ...prev]);
            showToast(`Task "${newTask.title}" created successfully!`, 'success');
          }}
        />
      )}

      {isWorkspaceModalOpen && (
        <CreateWorkspaceModal
          onClose={() => setIsWorkspaceModalOpen(false)}
          onWorkspaceCreated={(newWs) => {
            setWorkspaces((prev) => [newWs, ...prev]);
            setActiveWorkspace(newWs);
            showToast(`Workspace "${newWs.name}" created!`, 'success');
          }}
        />
      )}
    </div>
  );
}

export default App;
