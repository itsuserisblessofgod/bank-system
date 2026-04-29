import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService.js';
import { useAuth } from '../auth/AuthContext.jsx';

const COUNTRIES = ['US', 'GB', 'DE', 'FR', 'KZ', 'JP', 'BR', 'IN', 'CN', 'RU', 'KP', 'IR', 'SY'];

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', countryCode: 'US' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const data = await authService.register(form);
      login(data);
      navigate('/dashboard');
    } catch (ex) {
      setError(ex.response?.data?.message || 'Registration failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto card">
      <h1 className="text-2xl font-bold mb-6">Create account</h1>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Full name</label>
          <input className="input" required
            value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" required
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <label className="label">Password (8+ chars)</label>
          <input className="input" type="password" required minLength={8}
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <div>
          <label className="label">Country</label>
          <select className="input"
            value={form.countryCode} onChange={(e) => setForm({ ...form, countryCode: e.target.value })}>
            {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn-primary w-full" disabled={busy}>
          {busy ? 'Creating...' : 'Create account'}
        </button>
        <div className="text-sm text-slate-500 text-center">
          Already have an account? <Link to="/login" className="text-brand-600">Sign in</Link>
        </div>
      </form>
    </div>
  );
}
