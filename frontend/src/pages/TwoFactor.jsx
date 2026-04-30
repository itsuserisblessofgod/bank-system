import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../layout/AuthLayout.jsx';
import { Button, Alert } from '../components/ui/index.jsx';
import Icon from '../components/icons/Icon.jsx';

export default function TwoFactor() {
  const navigate = useNavigate();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [seconds, setSeconds] = useState(45);
  const refs = useRef([]);

  useEffect(() => {
    refs.current[0]?.focus();
    const t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const setAt = (i, v) => {
    const next = [...code];
    next[i] = v.replace(/\D/g, '').slice(0, 1);
    setCode(next);
    if (next[i] && i < 5) refs.current[i + 1]?.focus();
  };
  const onKey = (i, e) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) refs.current[i - 1]?.focus();
  };
  const onPaste = (e) => {
    const txt = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!txt) return;
    e.preventDefault();
    const arr = txt.split('').concat(Array(6).fill('')).slice(0, 6);
    setCode(arr);
    refs.current[Math.min(txt.length, 5)]?.focus();
  };

  const submit = (e) => {
    e.preventDefault();
    setError(null);
    if (code.some((c) => !c)) {
      setError('Enter the full 6-digit verification code.');
      return;
    }
    setBusy(true);
    // The backend doesn't expose 2FA — this is a UX scaffold. Treat any code as valid demo.
    setTimeout(() => { setBusy(false); navigate('/dashboard'); }, 600);
  };

  return (
    <AuthLayout
      title="Two-factor verification"
      subtitle="Enter the 6-digit code from your authenticator or hardware token."
      footer={<>Trouble receiving codes? <Link to="#" className="text-navy-900 font-medium hover:underline">Use backup method</Link></>}
    >
      <form onSubmit={submit} className="space-y-5">
        <div className="rounded-xl bg-navy-50 border border-navy-100 p-4 flex items-start gap-3">
          <Icon name="fingerprint" className="text-navy-700 mt-0.5" />
          <div className="text-[13px] text-navy-900">
            <div className="font-semibold">Secure session check</div>
            <div className="text-graphite-600">A code was sent to your registered device ending •••42.</div>
          </div>
        </div>

        {error && <Alert tone="danger">{error}</Alert>}

        <div className="grid grid-cols-6 gap-2" onPaste={onPaste}>
          {code.map((c, i) => (
            <input
              key={i}
              ref={(el) => (refs.current[i] = el)}
              inputMode="numeric"
              maxLength={1}
              value={c}
              onChange={(e) => setAt(i, e.target.value)}
              onKeyDown={(e) => onKey(i, e)}
              className="h-14 text-center text-2xl font-display font-semibold rounded-xl
                         border border-graphite-200 bg-white shadow-elev-1
                         focus:outline-none focus:border-navy-700 focus:shadow-ring-brand
                         text-navy-900 num"
            />
          ))}
        </div>

        <Button type="submit" loading={busy} className="w-full" size="lg">
          {busy ? 'Verifying…' : 'Verify and continue'}
        </Button>

        <div className="flex items-center justify-between text-[13px] text-graphite-500">
          <span>Code expires in <span className="font-mono font-semibold text-navy-900 num">{String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}</span></span>
          <button type="button" disabled={seconds > 0}
            onClick={() => setSeconds(45)}
            className="font-medium text-navy-900 hover:underline disabled:text-graphite-400 disabled:no-underline">
            Resend
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}
