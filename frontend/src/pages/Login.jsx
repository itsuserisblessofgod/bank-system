import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService.js';
import { useAuth } from '../auth/AuthContext.jsx';
import AuthLayout from '../layout/AuthLayout.jsx';
import { Button, Input, Field, Checkbox, Alert } from '../components/ui/index.jsx';
import Icon from '../components/icons/Icon.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(true);
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
      setError(ex.response?.data?.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Sign in to your secure portal"
      subtitle="Access institutional accounts, treasury operations, and risk dashboards."
      footer={<>New to EBMS? <Link to="/register" className="text-navy-900 font-medium hover:underline">Open an account</Link></>}
    >
      <form onSubmit={submit} className="space-y-5">
        {error && <Alert tone="danger" title="Sign in failed">{error}</Alert>}

        <Field label="Corporate email">
          <Input
            type="email"
            required
            autoComplete="email"
            placeholder="you@institution.com"
            leftIcon="mail"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </Field>

        <Field
          label={
            <span className="flex items-center justify-between">
              <span>Password</span>
              <Link to="#" className="text-[11px] font-medium text-navy-700 hover:underline normal-case">Forgot?</Link>
            </span>
          }
        >
          <Input
            type={showPwd ? 'text' : 'password'}
            required
            autoComplete="current-password"
            placeholder="••••••••••••"
            leftIcon="lock"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            rightSlot={
              <button type="button" onClick={() => setShowPwd((s) => !s)}
                className="p-1.5 text-graphite-400 hover:text-navy-900">
                <Icon name={showPwd ? 'eyeOff' : 'eye'} size={16} />
              </button>
            }
          />
        </Field>

        <div className="flex items-center justify-between">
          <Checkbox
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            label="Trust this device for 30 days"
          />
        </div>

        <Button type="submit" loading={busy} className="w-full" size="lg">
          {busy ? 'Authenticating…' : 'Sign in securely'}
        </Button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-graphite-200" /></div>
          <span className="relative bg-graphite-50 px-3 text-[11px] uppercase tracking-wider text-graphite-500">or continue with</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button type="button" className="btn btn-secondary"><Icon name="fingerprint" size={16} /> Biometric</button>
          <button type="button" className="btn btn-secondary"><Icon name="qr" size={16} /> QR sign-on</button>
        </div>

        <div className="mt-6 flex items-center gap-2 text-[11px] text-graphite-500 justify-center">
          <Icon name="shieldCheck" size={13} className="text-success-500" />
          <span>Encrypted via TLS 1.3 · Session protected by FIDO2</span>
        </div>
      </form>
    </AuthLayout>
  );
}
