import React, { useState } from 'react';
import { Workspace, Project } from '../types';
import { Plus, Folder, Copy, Check, Shield, Layers } from 'lucide-react';

interface Props {
  workspaces: Workspace[];
  activeWorkspace?: Workspace;
  onSelectWorkspace: (ws: Workspace) => void;
  onOpenNewWorkspace: () => void;
  projects: Project[];
  activeProjectId?: string;
  onSelectProject: (projectId: string) => void;
  onCreateProject: (name: string, color: string) => void;
}

export const Sidebar: React.FC<Props> = ({
  workspaces,
  activeWorkspace,
  onSelectWorkspace,
  onOpenNewWorkspace,
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProject,
}) => {
  const [newProjName, setNewProjName] = useState('');
  const [isCreatingProj, setIsCreatingProj] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyInvite = () => {
    if (activeWorkspace?.inviteCode) {
      navigator.clipboard.writeText(activeWorkspace.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjName.trim()) {
      onCreateProject(newProjName.trim(), '#6366F1');
      setNewProjName('');
      setIsCreatingProj(false);
    }
  };

  return (
    <aside className="sidebar">
      {/* Workspace Selector */}
      <div style={{ padding: 16, borderBottom: '1px solid #334155' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: 0.5 }}>
            Workspace
          </span>
          <button
            onClick={onOpenNewWorkspace}
            style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2, fontSize: 12, fontWeight: 600 }}
          >
            <Plus size={14} /> New
          </button>
        </div>

        <select
          className="input-field"
          style={{ margin: 0 }}
          value={activeWorkspace?._id || ''}
          onChange={(e) => {
            const selected = workspaces.find((w) => w._id === e.target.value);
            if (selected) onSelectWorkspace(selected);
          }}
        >
          {workspaces.map((ws) => (
            <option key={ws._id} value={ws._id}>
              {ws.name}
            </option>
          ))}
        </select>

        {activeWorkspace && (
          <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="badge" style={{ background: '#312e81', color: '#818cf8', fontSize: 10 }}>
              <Shield size={10} /> {activeWorkspace.currentUserRole || 'OWNER'}
            </span>

            <button
              onClick={handleCopyInvite}
              className="btn btn-secondary"
              style={{ padding: '3px 8px', fontSize: 11 }}
              title="Copy Workspace Invite Code"
            >
              {copied ? <Check size={11} color="#10b981" /> : <Copy size={11} />}
              <span>{copied ? 'Copied' : `Code: ${activeWorkspace.inviteCode}`}</span>
            </button>
          </div>
        )}
      </div>

      {/* Projects List */}
      <div style={{ flex: 1, padding: 16, overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Layers size={13} /> Projects
          </span>
          <button
            onClick={() => setIsCreatingProj(!isCreatingProj)}
            style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer' }}
            title="Create Project"
          >
            <Plus size={15} />
          </button>
        </div>

        {isCreatingProj && (
          <form onSubmit={handleProjectSubmit} style={{ marginBottom: 12 }}>
            <input
              type="text"
              className="input-field"
              placeholder="Project Name..."
              style={{ margin: '0 0 6px 0', fontSize: 12, padding: '6px 10px' }}
              value={newProjName}
              onChange={(e) => setNewProjName(e.target.value)}
              autoFocus
            />
            <div style={{ display: 'flex', gap: 4 }}>
              <button type="submit" className="btn btn-primary" style={{ padding: '4px 10px', fontSize: 11 }}>Add</button>
              <button type="button" className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => setIsCreatingProj(false)}>Cancel</button>
            </div>
          </form>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <button
            onClick={() => onSelectProject('')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              borderRadius: 6,
              background: !activeProjectId ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: !activeProjectId ? '#fff' : '#94a3b8',
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              textAlign: 'left',
              fontWeight: !activeProjectId ? 600 : 400,
            }}
          >
            <Folder size={14} /> All Tasks
          </button>

          {projects.map((proj) => (
            <button
              key={proj._id}
              onClick={() => onSelectProject(proj._id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                borderRadius: 6,
                background: activeProjectId === proj._id ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                color: activeProjectId === proj._id ? '#fff' : '#94a3b8',
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                textAlign: 'left',
                fontWeight: activeProjectId === proj._id ? 600 : 400,
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: proj.color || '#6366f1' }} />
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {proj.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};
