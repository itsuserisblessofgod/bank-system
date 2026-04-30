import { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService.js';
import { useAuth } from '../auth/AuthContext.jsx';
import AuthLayout from '../layout/AuthLayout.jsx';
import {
  Button, Input, Field, Select, Checkbox, Alert, ProgressBar,
} from '../components/ui/index.jsx';
import Icon from '../components/icons/Icon.jsx';

const COUNTRIES = [
  ['US', 'United States'], ['GB', 'United Kingdom'], ['DE', 'Germany'], ['FR', 'France'],
  ['KZ', 'Kazakhstan'], ['JP', 'Japan'], ['BR', 'Brazil'], ['IN', 'India'],
  ['CN', 'China'], ['RU', 'Russia'], ['KP', 'North Korea'], ['IR', 'Iran'], ['SY', 'Syria'],
];

function passwordScore(pwd) {
  if (!pwd) return 0;
  let s = 0;
  if (pwd.length >= 8) s += 25;
  if (pwd.length >= 12) s += 15;
  if (/[A-Z]/.test(pwd)) s += 15;
  if (/[a-z]/.test(pwd)) s += 10;
  if (/[0-9]/.test(pwd)) s += 15;
  if (/[^A-Za-z0-9]/.test(pwd)) s += 20;
  return Math.min(100, s);
}

const STEPS = [
  { id: 1, title: 'Identity', icon: 'profile' },
  { id: 2, title: 'Credentials', icon: 'lock' },
  { id: 3, title: 'Compliance', icon: 'shieldCheck' },
];

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', countryCode: 'US',
    phone: '', accountType: 'PERSONAL', tos: false, dataConsent: false,
  });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const score = useMemo(() => passwordScore(form.password), [form.password]);
  const scoreTone = score >= 75 ? 'bg-success-500' : score >= 45 ? 'bg-warning-500' : 'bg-danger-500';
  const scoreLabel = score >= 75 ? 'Strong' : score >= 45 ? 'Moderate' : score > 0 ? 'Weak' : '—';

  const next = () => {
    setError(null);
    if (step === 1 && (!form.fullName.trim() || !form.email.trim())) {
      setError('Please complete all required identity fields.');
      return;
    }
    if (step === 2 && (form.password.length < 8 || score < 45)) {
      setError('Choose a stronger password — at least 8 characters with mixed case and a number.');
      return;
    }
    setStep((s) => Math.min(3, s + 1));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.tos || !form.dataConsent) {
      setError('You must accept the disclosures and data processing notice to proceed.');
      return;
    }
    setBusy(true);
    try {
      const data = await authService.register({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        countryCode: form.countryCode,
      });
      login(data);
      navigate('/dashboard');
    } catch (ex) {
      setError(ex.response?.data?.message || 'Registration failed. Please review the form and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Open your institutional account"
      subtitle="Three-step verified onboarding · Typical completion ~3 minutes."
      footer={<>Already a client? <Link to="/login" className="text-navy-900 font-medium hover:underline">Sign in</Link></>}
    >
      {/* Stepper */}
      <ol className="grid grid-cols-3 gap-2 mb-6">
        {STEPS.map((s) => {
          const active = step === s.id, done = step > s.id;
          return (
            <li key={s.id} className="flex flex-col items-center text-center">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold ring-2 ring-offset-2
                ${done ? 'bg-success-500 text-white ring-success-100' : active ? 'bg-navy-900 text-white ring-navy-100' : 'bg-graphite-100 text-graphite-500 ring-graphite-100'}`}>
                {done ? <Icon name="check" size={14} /> : s.id}
              </div>
              <div className={`mt-1.5 text-[11px] font-medium ${active || done ? 'text-navy-900' : 'text-graphite-500'}`}>{s.title}</div>
            </li>
          );
        })}
      </ol>

      {error && <Alert tone="danger" className="mb-4">{error}</Alert>}

      <form onSubmit={submit} className="space-y-4">
        {step === 1 && (
          <>
            <Field label="Account type">
              <Select value={form.accountType} onChange={(e) => setForm({ ...form, accountType: e.target.value })}>
                <option value="PERSONAL">Personal · Private Banking</option>
                <option value="BUSINESS">Business · Corporate Treasury</option>
                <option value="INSTITUTIONAL">Institutional · Custody</option>
              </Select>
            </Field>
            <Field label="Legal full name">
              <Input required leftIcon="user" placeholder="Eleanor R. Sterling" autoComplete="name"
                value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            </Field>
            <Field label="Email" hint="We'll send a verification link before activation.">
              <Input required type="email" leftIcon="mail" placeholder="you@institution.com" autoComplete="email"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Country">
                <Select value={form.countryCode} onChange={(e) => setForm({ ...form, countryCode: e.target.value })}>
                  {COUNTRIES.map(([c, n]) => <option key={c} value={c}>{n} ({c})</option>)}
                </Select>
              </Field>
              <Field label="Phone (optional)">
                <Input leftIcon="phone" placeholder="+1 (000) 000-0000"
                  value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </Field>
            </div>
            <Button type="button" onClick={next} className="w-full" size="lg" rightIcon="arrowRight">
              Continue
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <Field label="Choose a strong password" hint="Minimum 8 characters · Mix letters, numbers, symbols.">
              <Input required type="password" leftIcon="lock" minLength={8} autoComplete="new-password"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </Field>
            <div className="-mt-2">
              <ProgressBar value={score} color={scoreTone} />
              <div className="mt-1.5 text-[11px] text-graphite-500 flex items-center justify-between">
                <span>Strength: <span className="font-semibold text-navy-900">{scoreLabel}</span></span>
                <span className="font-mono">{form.password.length} chars</span>
              </div>
            </div>
            <ul className="grid grid-cols-2 gap-1.5 text-[11px] text-graphite-600 mt-1">
              {[
                ['8+ characters', form.password.length >= 8],
                ['Uppercase letter', /[A-Z]/.test(form.password)],
                ['Number', /[0-9]/.test(form.password)],
                ['Symbol', /[^A-Za-z0-9]/.test(form.password)],
              ].map(([label, ok]) => (
                <li key={label} className={`inline-flex items-center gap-1.5 ${ok ? 'text-success-700' : ''}`}>
                  <Icon name={ok ? 'check' : 'close'} size={12} />
                  {label}
                </li>
              ))}
            </ul>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setStep(1)} leftIcon="arrowLeft">Back</Button>
              <Button type="button" onClick={next} className="flex-1" rightIcon="arrowRight">Continue</Button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="rounded-xl bg-graphite-50 ring-1 ring-graphite-200 p-4 text-sm text-graphite-700">
              <div className="flex items-center gap-2 text-navy-900 font-medium mb-2">
                <Icon name="shieldCheck" size={16} /> Regulatory disclosures
              </div>
              <p className="leading-relaxed text-[13px]">
                EBMS Holdings is regulated by the OCC and FCA. By proceeding, you confirm that information
                provided is accurate and acknowledge our compliance with KYC, AML, and FATCA reporting.
              </p>
            </div>

            <Checkbox
              checked={form.tos}
              onChange={(e) => setForm({ ...form, tos: e.target.checked })}
              label={<>I accept the <a className="text-navy-900 underline" href="#">Terms of Service</a> and <a className="text-navy-900 underline" href="#">Account Disclosures</a></>}
            />
            <Checkbox
              checked={form.dataConsent}
              onChange={(e) => setForm({ ...form, dataConsent: e.target.checked })}
              label="I consent to identity verification, sanctions screening, and data processing under GDPR/CCPA."
            />

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setStep(2)} leftIcon="arrowLeft">Back</Button>
              <Button type="submit" loading={busy} className="flex-1">
                {busy ? 'Creating account…' : 'Open account'}
              </Button>
            </div>
          </>
        )}
      </form>
    </AuthLayout>
  );
}
