import React from 'react';
import { Task, TaskStatus } from '../types';
import { Calendar, Flag, Trash2, ChevronRight, ChevronLeft, Repeat } from 'lucide-react';

interface Props {
  tasks: Task[];
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenCreateModal: () => void;
}

const COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'TODO', title: 'To Do', color: '#6366f1' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: '#f59e0b' },
  { id: 'IN_REVIEW', title: 'In Review', color: '#8b5cf6' },
  { id: 'DONE', title: 'Completed', color: '#10b981' },
];

export const KanbanBoard: React.FC<Props> = ({
  tasks,
  onStatusChange,
  onDeleteTask,
  onOpenCreateModal: _onOpenCreateModal,
}) => {
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' };
      case 'HIGH':
        return { bg: 'rgba(249, 115, 22, 0.15)', color: '#f97316' };
      case 'MEDIUM':
        return { bg: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' };
      default:
        return { bg: '#1e293b', color: '#94a3b8' };
    }
  };

  const getNextStatus = (current: TaskStatus): TaskStatus | null => {
    const order: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
    const idx = order.indexOf(current);
    return idx < order.length - 1 ? order[idx + 1] : null;
  };

  const getPrevStatus = (current: TaskStatus): TaskStatus | null => {
    const order: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
    const idx = order.indexOf(current);
    return idx > 0 ? order[idx - 1] : null;
  };

  return (
    <div className="kanban-board">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);

        return (
          <div key={col.id} className="kanban-col">
            <div className="kanban-col-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: col.color,
                  }}
                />
                <span style={{ color: '#fff' }}>{col.title}</span>
              </div>
              <span className="badge" style={{ background: '#1e293b', color: '#94a3b8' }}>
                {colTasks.length}
              </span>
            </div>

            <div className="kanban-card-list">
              {colTasks.length === 0 ? (
                <div
                  style={{
                    padding: '32px 12px',
                    textAlign: 'center',
                    color: '#475569',
                    fontSize: 13,
                    border: '1px dashed #1e293b',
                    borderRadius: 8,
                  }}
                >
                  No tasks here
                </div>
              ) : (
                colTasks.map((task) => {
                  const pStyle = getPriorityStyle(task.priority);
                  const nextStatus = getNextStatus(task.status);
                  const prevStatus = getPrevStatus(task.status);

                  return (
                    <div key={task._id} className="task-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <span
                          className="badge"
                          style={{ background: pStyle.bg, color: pStyle.color }}
                        >
                          <Flag size={10} /> {task.priority}
                        </span>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {task.isRecurring && (
                            <span className="badge" style={{ background: 'rgba(129, 140, 248, 0.1)', color: '#818cf8' }} title="Recurring BullMQ Job">
                              <Repeat size={10} />
                            </span>
                          )}
                          <button
                            onClick={() => onDeleteTask(task._id)}
                            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                            title="Delete Task"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <h4 style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 6 }}>
                        {task.title}
                      </h4>

                      {task.description && (
                        <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10, lineHeight: 1.4 }}>
                          {task.description}
                        </p>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTop: '1px solid #334155' }}>
                        {task.dueDate ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#94a3b8' }}>
                            <Calendar size={12} />
                            {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </div>
                        ) : (
                          <div />
                        )}

                        <div style={{ display: 'flex', gap: 4 }}>
                          {prevStatus && (
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '4px 6px', fontSize: 11 }}
                              onClick={() => onStatusChange(task._id, prevStatus)}
                              title={`Move back to ${prevStatus}`}
                            >
                              <ChevronLeft size={12} />
                            </button>
                          )}
                          {nextStatus && (
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '4px 6px', fontSize: 11 }}
                              onClick={() => onStatusChange(task._id, nextStatus)}
                              title={`Move to ${nextStatus}`}
                            >
                              <ChevronRight size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
