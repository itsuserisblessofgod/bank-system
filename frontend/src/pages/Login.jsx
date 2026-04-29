import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService.js';
import { useAuth } from '../auth/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const data = await authService.login(form);
      login(data);
      navigate('/dashboard');
    } catch (ex) {
      setError(ex.response?.data?.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto card">
      <h1 className="text-2xl font-bold mb-6">Sign in</h1>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" required
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" required
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn-primary w-full" disabled={busy}>
          {busy ? 'Signing in...' : 'Sign in'}
        </button>
        <div className="text-sm text-slate-500 text-center">
          No account? <Link to="/register" className="text-brand-600">Register</Link>
        </div>
      </form>
    </div>
  );
}
