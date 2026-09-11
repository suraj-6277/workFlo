import React, { useState } from 'react';
import { Task, TaskStatus } from '../types';
import { Calendar, Flag, Trash2, ChevronRight, ChevronLeft, Repeat, GripVertical } from 'lucide-react';

interface Props {
  tasks: Task[];
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenCreateModal: () => void;
}

const COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'TODO', title: 'To Do', color: '#6366f1' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: '#f59e0b' },
  { id: 'IN_REVIEW', title: 'In Review', color: '#a855f7' },
  { id: 'DONE', title: 'Completed', color: '#10b981' },
];

export const KanbanBoard: React.FC<Props> = ({
  tasks,
  onStatusChange,
  onDeleteTask,
  onOpenCreateModal,
}) => {
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [activeDropCol, setActiveDropCol] = useState<TaskStatus | null>(null);

  const getPriorityAccent = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return {
          borderLeft: '4px solid #ef4444',
          badgeBg: 'rgba(239, 68, 68, 0.15)',
          badgeColor: '#ef4444',
        };
      case 'HIGH':
        return {
          borderLeft: '4px solid #f97316',
          badgeBg: 'rgba(249, 115, 22, 0.15)',
          badgeColor: '#f97316',
        };
      case 'MEDIUM':
        return {
          borderLeft: '4px solid #6366f1',
          badgeBg: 'rgba(99, 102, 241, 0.15)',
          badgeColor: '#818cf8',
        };
      default:
        return {
          borderLeft: '4px solid #64748b',
          badgeBg: '#1e293b',
          badgeColor: '#94a3b8',
        };
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

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingTaskId(taskId);
  };

  const handleDragEnd = () => {
    setDraggingTaskId(null);
    setActiveDropCol(null);
  };

  const handleDragOver = (e: React.DragEvent, colId: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (activeDropCol !== colId) {
      setActiveDropCol(colId);
    }
  };

  const handleDragLeave = (e: React.DragEvent, colId: TaskStatus) => {
    // Only reset if leaving the column element itself
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (activeDropCol === colId) {
      setActiveDropCol(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetCol: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggingTaskId;
    if (taskId) {
      const task = tasks.find((t) => t._id === taskId);
      if (task && task.status !== targetCol) {
        onStatusChange(taskId, targetCol);
      }
    }
    setActiveDropCol(null);
    setDraggingTaskId(null);
  };

  return (
    <div className="kanban-board">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);
        const isDropTarget = activeDropCol === col.id;

        return (
          <div
            key={col.id}
            className={`kanban-col ${isDropTarget ? 'kanban-col-drop-active' : ''}`}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={(e) => handleDragLeave(e, col.id)}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <div className="kanban-col-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: '50%',
                    background: col.color,
                    boxShadow: `0 0 10px ${col.color}88`,
                  }}
                />
                <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>{col.title}</span>
              </div>
              <span className="badge" style={{ background: '#1e293b', color: '#94a3b8' }}>
                {colTasks.length}
              </span>
            </div>

            <div className="kanban-card-list">
              {colTasks.length === 0 ? (
                <div className={`kanban-empty-dropzone ${isDropTarget ? 'active' : ''}`}>
                  <div>{isDropTarget ? 'Release to drop here' : 'No tasks in this column'}</div>
                  {col.id === 'TODO' && !isDropTarget && (
                    <button
                      className="btn btn-secondary"
                      style={{ fontSize: 11, padding: '4px 8px', marginTop: 8 }}
                      onClick={onOpenCreateModal}
                    >
                      + Add Task
                    </button>
                  )}
                </div>
              ) : (
                colTasks.map((task) => {
                  const pStyle = getPriorityAccent(task.priority);
                  const nextStatus = getNextStatus(task.status);
                  const prevStatus = getPrevStatus(task.status);
                  const isBeingDragged = draggingTaskId === task._id;

                  return (
                    <div
                      key={task._id}
                      className={`task-card ${isBeingDragged ? 'task-card-dragging' : ''}`}
                      style={{ borderLeft: pStyle.borderLeft }}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, task._id)}
                      onDragEnd={handleDragEnd}
                    >
                      {/* Top Header: Priority Badge + Drag Handle + Delete */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span
                            className="badge"
                            style={{ background: pStyle.badgeBg, color: pStyle.badgeColor }}
                          >
                            <Flag size={10} /> {task.priority}
                          </span>
                          {task.isRecurring && (
                            <span
                              className="badge"
                              style={{ background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8' }}
                              title="Recurring BullMQ Automation"
                            >
                              <Repeat size={10} />
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span className="drag-handle" title="Drag to move columns">
                            <GripVertical size={13} color="#64748b" />
                          </span>
                          <button
                            onClick={() => onDeleteTask(task._id)}
                            className="card-delete-btn"
                            title="Delete Task"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Title */}
                      <h4 style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 6, lineHeight: 1.4 }}>
                        {task.title}
                      </h4>

                      {/* Description */}
                      {task.description && (
                        <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10, lineHeight: 1.4 }}>
                          {task.description}
                        </p>
                      )}

                      {/* Footer: Due Date & Navigation Chevrons */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginTop: 10,
                          paddingTop: 8,
                          borderTop: '1px solid rgba(51, 65, 85, 0.5)',
                        }}
                      >
                        {task.dueDate ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#94a3b8' }}>
                            <Calendar size={12} />
                            {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </div>
                        ) : (
                          <div />
                        )}

                        {/* Quick Step Chevrons */}
                        <div style={{ display: 'flex', gap: 4 }}>
                          {prevStatus && (
                            <button
                              className="step-btn"
                              onClick={() => onStatusChange(task._id, prevStatus)}
                              title={`Move back to ${prevStatus}`}
                            >
                              <ChevronLeft size={13} />
                            </button>
                          )}
                          {nextStatus && (
                            <button
                              className="step-btn"
                              onClick={() => onStatusChange(task._id, nextStatus)}
                              title={`Move to ${nextStatus}`}
                            >
                              <ChevronRight size={13} />
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
