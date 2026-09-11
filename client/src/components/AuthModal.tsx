import React, { useState } from 'react';
import { api } from '../services/api';
import { User } from '../types';
import { Lock, Mail, User as UserIcon } from 'lucide-react';

interface Props {
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<Props> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('Suraj Jadhav');
  const [email, setEmail] = useState('suraj@example.com');
  const [password, setPassword] = useState('SecurePass123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const { user } = await api.login({ email, password });
        onSuccess(user);
      } else {
        const { user } = await api.register({ name, email, password });
        onSuccess(user);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(5, 8, 17, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div className="modal-content" style={{ maxWidth: 440, background: '#0f172a', border: '1px solid #334155', borderRadius: 16, padding: 32 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Lock size={24} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>Welcome to Workflo</h2>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
            {isLogin ? 'Sign in with your email & password' : 'Create your account to start managing tasks'}
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div>
              <label style={{ fontSize: 12, color: '#94a3b8' }}>Full Name</label>
              <div style={{ position: 'relative', marginTop: 4, marginBottom: 12 }}>
                <UserIcon size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#64748b' }} />
                <input
                  type="text"
                  className="input-field"
                  style={{ paddingLeft: 36, margin: 0 }}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: 12, color: '#94a3b8' }}>Email Address</label>
            <div style={{ position: 'relative', marginTop: 4, marginBottom: 12 }}>
              <Mail size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#64748b' }} />
              <input
                type="email"
                className="input-field"
                style={{ paddingLeft: 36, margin: 0 }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: '#94a3b8' }}>Password</label>
            <div style={{ position: 'relative', marginTop: 4, marginBottom: 18 }}>
              <Lock size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#64748b' }} />
              <input
                type="password"
                className="input-field"
                style={{ paddingLeft: 36, margin: 0 }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', justifyContent: 'center' }}
            disabled={loading}
          >
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: '#94a3b8' }}>
          {isLogin ? "Don't have an account? " : 'Already registered? '}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            style={{ background: 'none', border: 'none', color: '#818cf8', fontWeight: 600, cursor: 'pointer' }}
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </div>
      </div>
    </div>
  );
};
