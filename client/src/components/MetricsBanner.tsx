import React from 'react';
import { Task } from '../types';
import { ListTodo, Clock, Eye, CheckCircle, Repeat } from 'lucide-react';

interface Props {
  tasks: Task[];
}

export const MetricsBanner: React.FC<Props> = ({ tasks }) => {
  const total = tasks.length;
  const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const inReview = tasks.filter((t) => t.status === 'IN_REVIEW').length;
  const completed = tasks.filter((t) => t.status === 'DONE').length;
  const recurring = tasks.filter((t) => t.isRecurring).length;

  const metrics = [
    {
      label: 'Total Tasks',
      value: total,
      icon: ListTodo,
      color: '#818cf8',
      bg: 'rgba(99, 102, 241, 0.1)',
      border: 'rgba(99, 102, 241, 0.25)',
    },
    {
      label: 'In Progress',
      value: inProgress,
      icon: Clock,
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.1)',
      border: 'rgba(245, 158, 11, 0.25)',
    },
    {
      label: 'In Review',
      value: inReview,
      icon: Eye,
      color: '#a855f7',
      bg: 'rgba(168, 85, 247, 0.1)',
      border: 'rgba(168, 85, 247, 0.25)',
    },
    {
      label: 'Completed',
      value: completed,
      icon: CheckCircle,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.1)',
      border: 'rgba(168, 85, 247, 0.25)',
    },
    {
      label: 'BullMQ Recurring',
      value: recurring,
      icon: Repeat,
      color: '#38bdf8',
      bg: 'rgba(56, 189, 248, 0.1)',
      border: 'rgba(56, 189, 248, 0.25)',
    },
  ];

  return (
    <div className="metrics-banner">
      {metrics.map((m) => {
        const Icon = m.icon;
        return (
          <div
            key={m.label}
            className="metric-card"
            style={{
              background: m.bg,
              borderColor: m.border,
            }}
          >
            <div className="metric-icon-wrap" style={{ color: m.color }}>
              <Icon size={16} />
            </div>
            <div className="metric-info">
              <span className="metric-value" style={{ color: '#fff' }}>
                {m.value}
              </span>
              <span className="metric-label">{m.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
