import React, { useState } from 'react';
import { User, Workspace, Notification } from '../types';
import { Bell, Plus, LogOut, CheckCircle2, Menu } from 'lucide-react';
import { NotificationDrawer } from './NotificationDrawer';

interface Props {
  user: User;
  activeWorkspace?: Workspace;
  notifications: Notification[];
  onOpenCreateTask: () => void;
  onLogout: () => void;
  onRefreshNotifications: () => void;
  onToggleMobileSidebar?: () => void;
}

export const Navbar: React.FC<Props> = ({
  user,
  activeWorkspace,
  notifications,
  onOpenCreateTask,
  onLogout,
  onRefreshNotifications,
  onToggleMobileSidebar,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="top-nav">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Mobile Hamburger Menu Toggle */}
        <button
          className="mobile-hamburger-btn"
          onClick={onToggleMobileSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 16, color: '#fff' }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={18} color="#fff" />
          </div>
          <span className="brand-title">Workflo</span>
        </div>

        {activeWorkspace && (
          <div className="workspace-breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8', fontSize: 13 }}>
            <span>/</span>
            <span style={{ color: '#fff', fontWeight: 600 }}>{activeWorkspace.name}</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {activeWorkspace && (
          <button className="btn btn-primary nav-add-task-btn" onClick={onOpenCreateTask}>
            <Plus size={15} /> <span className="btn-label">Add Task</span>
          </button>
        )}

        {/* Notification Bell with Badge */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 8,
              padding: 8,
              color: '#f8fafc',
              cursor: 'pointer',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  background: '#ef4444',
                  color: '#fff',
                  borderRadius: '50%',
                  width: 16,
                  height: 16,
                  fontSize: 10,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <NotificationDrawer
              notifications={notifications}
              onRefresh={onRefreshNotifications}
              onClose={() => setShowNotifications(false)}
            />
          )}
        </div>

        {/* User Profile & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 10, borderLeft: '1px solid #334155' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#312e81', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="nav-user-name" style={{ fontSize: 13, fontWeight: 600, color: '#f8fafc' }}>
            {user.name}
          </div>
          <button
            onClick={onLogout}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', marginLeft: 2 }}
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
