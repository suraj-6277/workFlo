import React from 'react';
import { Search, X, Filter } from 'lucide-react';

interface Props {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedPriority: string;
  onPriorityChange: (p: string) => void;
  totalFiltered: number;
  totalTasks: number;
}

const PRIORITIES = [
  { id: 'ALL', label: 'All' },
  { id: 'URGENT', label: '🔥 Urgent', color: '#ef4444' },
  { id: 'HIGH', label: '⚡ High', color: '#f97316' },
  { id: 'MEDIUM', label: 'Medium', color: '#818cf8' },
  { id: 'LOW', label: 'Low', color: '#94a3b8' },
];

export const TaskFilterBar: React.FC<Props> = ({
  searchQuery,
  onSearchChange,
  selectedPriority,
  onPriorityChange,
  totalFiltered,
  totalTasks,
}) => {
  const isFiltered = searchQuery.trim() !== '' || selectedPriority !== 'ALL';

  const handleClear = () => {
    onSearchChange('');
    onPriorityChange('ALL');
  };

  return (
    <div className="task-filter-bar">
      <div className="search-input-wrap">
        <Search size={15} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Filter tasks by title or description..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchQuery && (
          <button className="search-clear-btn" onClick={() => onSearchChange('')}>
            <X size={13} />
          </button>
        )}
      </div>

      <div className="priority-chips-wrap">
        <div className="filter-label">
          <Filter size={13} />
          <span>Priority:</span>
        </div>
        {PRIORITIES.map((p) => {
          const isActive = selectedPriority === p.id;
          return (
            <button
              key={p.id}
              className={`priority-chip ${isActive ? 'active' : ''}`}
              onClick={() => onPriorityChange(p.id)}
            >
              {p.label}
            </button>
          );
        })}

        {isFiltered && (
          <button className="clear-all-filters-btn" onClick={handleClear}>
            <X size={12} /> Clear Filters ({totalFiltered}/{totalTasks})
          </button>
        )}
      </div>
    </div>
  );
};

