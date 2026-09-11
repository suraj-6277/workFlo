import React, { useState } from 'react';
import { User, Workspace, Notification } from '../types';
import { Bell, Plus, LogOut, CheckCircle2 } from 'lucide-react';
import { NotificationDrawer } from './NotificationDrawer';

interface Props {
  user: User;
  activeWorkspace?: Workspace;
  notifications: Notification[];
  onOpenCreateTask: () => void;
  onLogout: () => void;
  onRefreshNotifications: () => void;
}

export const Navbar: React.FC<Props> = ({
  user,
  activeWorkspace,
  notifications,
  onOpenCreateTask,
  onLogout,
  onRefreshNotifications,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="top-nav">
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 16, color: '#fff' }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={18} color="#fff" />
          </div>
          <span>Workflo</span>
        </div>

        {activeWorkspace && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8', fontSize: 13 }}>
            <span>/</span>
            <span style={{ color: '#fff', fontWeight: 600 }}>{activeWorkspace.name}</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {activeWorkspace && (
          <button className="btn btn-primary" onClick={onOpenCreateTask}>
            <Plus size={15} /> Add Task
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 12, borderLeft: '1px solid #334155' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#312e81', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#f8fafc' }}>
            {user.name}
          </div>
          <button
            onClick={onLogout}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', marginLeft: 4 }}
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
