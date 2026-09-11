import React, { useState, useEffect } from 'react';
import { Notification } from '../types';
import { api } from '../services/api';
import { Bell, Check, Clock, Sparkles, X } from 'lucide-react';

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
  const [triggering, setTriggering] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleMarkAllRead = async () => {
    await api.markAllNotificationsRead();
    onRefresh();
  };

  const handleTriggerTest = async () => {
    setTriggering(true);
    try {
      await api.triggerTestNotification();
      onRefresh();
    } catch (err) {
      console.error('Failed to trigger test notification:', err);
    } finally {
      setTriggering(false);
    }
  };

  return (
    <>
      {/* Click-away backdrop overlay to close by clicking anywhere outside */}
      <div
        className="notification-drawer-backdrop"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 45,
          background: 'transparent',
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        style={{
          position: 'absolute',
          top: 60,
          right: 0,
          width: 380,
          maxWidth: 'calc(100vw - 32px)',
          background: '#0f172a',
          border: '1px solid #334155',
          borderRadius: 12,
          boxShadow: '0 20px 30px -5px rgba(0, 0, 0, 0.7), 0 0 15px rgba(99, 102, 241, 0.1)',
          zIndex: 50,
          overflow: 'hidden',
          animation: 'toastSlideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid #334155',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(15, 23, 42, 0.8)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 14 }}>
            <Bell size={16} color="#818cf8" />
            <span>Notifications</span>
            <span style={{ fontSize: 11, background: '#312e81', color: '#818cf8', padding: '1px 6px', borderRadius: 9999 }}>
              {notifications.filter((n) => !n.isRead).length}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={handleTriggerTest}
              disabled={triggering}
              style={{
                background: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid #6366f1',
                color: '#818cf8',
                borderRadius: 6,
                padding: '3px 8px',
                fontSize: 11,
                fontWeight: 600,
                cursor: triggering ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
              title="Fire a live BullMQ test notification"
            >
              <Sparkles size={12} /> {triggering ? 'Sending...' : 'Test Alert'}
            </button>

            <button
              onClick={handleMarkAllRead}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                fontSize: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                padding: '3px 6px',
                borderRadius: 4,
              }}
              title="Mark all as read"
            >
              <Check size={13} /> Mark read
            </button>

            {/* Prominent Header Close 'X' Button */}
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px',
                borderRadius: 6,
                marginLeft: 2,
              }}
              title="Close notifications (Esc)"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div style={{ maxHeight: 360, overflowY: 'auto' }}>
          {notifications.length === 0 ? (
            <div style={{ padding: '36px 16px', textAlign: 'center', color: '#64748b', fontSize: 13 }}>
              <p style={{ marginBottom: 12 }}>No notifications yet.</p>
              <button
                onClick={handleTriggerTest}
                disabled={triggering}
                className="btn btn-primary"
                style={{ fontSize: 12, padding: '6px 14px', margin: '0 auto' }}
              >
                <Sparkles size={13} style={{ marginRight: 4 }} />
                {triggering ? 'Firing Alert...' : 'Send First Test Alert'}
              </button>
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
                  transition: 'background 0.15s ease',
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
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2, lineHeight: 1.4 }}>{n.message}</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={11} /> {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Wide Clickable Button */}
        <div
          style={{
            padding: '10px 16px',
            background: '#090d16',
            borderTop: '1px solid #334155',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{
              width: '100%',
              justifyContent: 'center',
              fontSize: 12,
              padding: '6px 12px',
              color: '#94a3b8',
              cursor: 'pointer',
            }}
          >
            Close Notifications
          </button>
        </div>
      </div>
    </>
  );
};
