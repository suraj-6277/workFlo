import React from 'react';
import { Notification } from '../types';
import { api } from '../services/api';
import { Bell, Check, Clock } from 'lucide-react';

interface Props {
  notifications: Notification[];
  onRefresh: () => void;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<Props> = ({
  notifications,
  onRefresh,
  onClose,
}) => {
  const handleMarkAllRead = async () => {
    await api.markAllNotificationsRead();
    onRefresh();
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 60,
        right: 24,
        width: 380,
        background: '#0f172a',
        border: '1px solid #334155',
        borderRadius: 12,
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.6)',
        zIndex: 50,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #334155',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 14 }}>
          <Bell size={16} color="#818cf8" />
          <span>Notifications</span>
          <span style={{ fontSize: 11, background: '#312e81', color: '#818cf8', padding: '1px 6px', borderRadius: 9999 }}>
            {notifications.filter((n) => !n.isRead).length}
          </span>
        </div>
        <button
          onClick={handleMarkAllRead}
          style={{
            background: 'none',
            border: 'none',
            color: '#818cf8',
            fontSize: 12,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Check size={14} /> Mark all read
        </button>
      </div>

      <div style={{ maxHeight: 360, overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: '#64748b', fontSize: 13 }}>
            No notifications yet
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid #1e293b',
                background: n.isRead ? 'transparent' : 'rgba(99, 102, 241, 0.05)',
                display: 'flex',
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: n.isRead ? 'transparent' : '#6366f1',
                  marginTop: 6,
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#f8fafc' }}>{n.title}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{n.message}</div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={11} /> {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ padding: '8px 16px', background: '#090d16', textAlign: 'center', borderTop: '1px solid #334155' }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 12, cursor: 'pointer' }}>
          Close
        </button>
      </div>
    </div>
  );
};
