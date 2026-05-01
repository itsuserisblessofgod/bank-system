import { useState } from 'react';
import api from '../services/api.js';
import PageHeader from '../layout/PageHeader.jsx';
import {
  Card, CardHeader, Button, Switch, Field, Input, Select, Badge, Alert, Tabs,
} from '../components/ui/index.jsx';
import Icon from '../components/icons/Icon.jsx';

const SESSIONS = [
  { device: 'MacBook Pro · Safari 17', location: 'New York, US', ip: '74.12.•••.18', when: 'Active now', current: true },
  { device: 'iPhone 15 Pro · iOS 18', location: 'New York, US', ip: '74.12.•••.18', when: '12 minutes ago', current: false },
  { device: 'Bloomberg Terminal · BBA', location: 'New York, US', ip: '162.93.•••.04', when: '2 hours ago', current: false },
  { device: 'iPad · Safari', location: 'Aspen, US', ip: '38.140.•••.91', when: 'Yesterday', current: false },
];

export default function Settings() {
  const [tab, setTab] = useState('security');
  const [twoFa, setTwoFa] = useState(true);
  const [biometric, setBiometric] = useState(true);
  const [marketing, setMarketing] = useState(false);
  const [statementsEmail, setStatementsEmail] = useState(true);
  const [largeTxAlert, setLargeTxAlert] = useState(true);
  const [loginAlert, setLoginAlert] = useState(true);
  const [pushAlert, setPushAlert] = useState(true);
  const [theme, setTheme] = useState('system');
  const [currency, setCurrency] = useState('USD');
  const [language, setLanguage] = useState('en-US');
  
  // Password form state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [pwdBusy, setPwdBusy] = useState(false);
  const [pwdError, setPwdError] = useState(null);
  const [pwdSuccess, setPwdSuccess] = useState(false);

  const handleChangePassword = async () => {
    setPwdError(null);
    setPwdSuccess(false);
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwdError('Please fill in all password fields.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPwdError('New passwords do not match.');
      return;
    }
    
    if (newPassword.length < 12) {
      setPwdError('Password must be at least 12 characters.');
      return;
    }
    
    setPwdBusy(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      setPwdSuccess(true);
      setShowPasswordForm(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (ex) {
      setPwdError(ex.response?.data?.message || 'Password change failed.');
    } finally {
      setPwdBusy(false);
    }
  };

  const resetPasswordForm = () => {
    setShowPasswordForm(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPwdError(null);
    setPwdSuccess(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Preferences"
        title="Settings"
        subtitle="Configure your security perimeter, notification matrix, and personal preferences."
      />

      <Tabs value={tab} onChange={setTab} items={[
        { value: 'security',     label: 'Security',     icon: 'shield' },
        { value: 'sessions',     label: 'Devices & sessions', icon: 'fingerprint' },
        { value: 'notifications', label: 'Notifications', icon: 'notifications' },
        { value: 'preferences',  label: 'Preferences',  icon: 'settings' },
      ]} />

      {tab === 'security' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <Card>
            <CardHeader eyebrow="Authentication" title="Multi-factor & biometrics" subtitle="A layered defence is required for accounts holding over $25,000." />
            <div className="mt-4 divide-y divide-graphite-200 dark:divide-graphite-800">
              <div className="py-4">
                <Switch checked={twoFa} onChange={setTwoFa}
                  label="Two-factor authentication"
                  description="Authenticator app or hardware key required at every sign-in." />
              </div>
              <div className="py-4">
                <Switch checked={biometric} onChange={setBiometric}
                  label="Biometric on this device"
                  description="Use Touch ID / Face ID for high-value approvals." />
              </div>
              <div className="py-4">
                <div className="text-sm font-medium text-navy-900 dark:text-graphite-100">Hardware security keys</div>
                <div className="text-xs text-graphite-500 mt-0.5">Hardware key enrollment is not yet available in the MVP.</div>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader eyebrow="Password" title="Change your password"
              subtitle="A 12+ character passphrase is recommended. Last changed 4 months ago." />
            {pwdSuccess && !showPasswordForm && (
              <Alert tone="success" className="mt-4">Password changed successfully.</Alert>
            )}
            {!showPasswordForm ? (
              <div className="mt-4">
                <Button leftIcon="lock" onClick={() => setShowPasswordForm(true)}>Change password</Button>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {pwdError && <Alert tone="danger">{pwdError}</Alert>}
                <Field label="Current password">
                  <Input 
                    type={showCurrentPwd ? 'text' : 'password'} 
                    leftIcon="lock"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    rightSlot={
                      <button type="button" onClick={() => setShowCurrentPwd((s) => !s)}
                        className="p-1.5 text-graphite-400 hover:text-navy-900">
                        <Icon name={showCurrentPwd ? 'eyeOff' : 'eye'} size={16} />
                      </button>
                    }
                  />
                </Field>
                <Field label="New password">
                  <Input 
                    type={showNewPwd ? 'text' : 'password'} 
                    leftIcon="lock"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    rightSlot={
                      <button type="button" onClick={() => setShowNewPwd((s) => !s)}
                        className="p-1.5 text-graphite-400 hover:text-navy-900">
                        <Icon name={showNewPwd ? 'eyeOff' : 'eye'} size={16} />
                      </button>
                    }
                  />
                </Field>
                <Field label="Confirm new password">
                  <Input 
                    type={showNewPwd ? 'text' : 'password'} 
                    leftIcon="lock"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </Field>
                <Alert tone="warning">All other active sessions will be signed out for safety.</Alert>
                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" onClick={resetPasswordForm}>Cancel</Button>
                  <Button leftIcon="check" loading={pwdBusy} onClick={handleChangePassword}>Update password</Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {tab === 'sessions' && (
        <Card flush>
          <div className="px-6 pt-5">
            <CardHeader eyebrow="Active sessions" title="Devices connected to your account"
              subtitle="Sign out of any device immediately. Compromised devices should be revoked." />
          </div>
          <div className="overflow-x-auto mt-4">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="!pl-6">Device</th>
                  <th>Location / IP</th>
                  <th>Last activity</th>
                  <th className="!pr-6"></th>
                </tr>
              </thead>
              <tbody>
                {SESSIONS.map((s) => (
                  <tr key={s.device}>
                    <td className="!pl-6">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-navy-50 text-navy-700 flex items-center justify-center ring-1 ring-navy-100">
                          <Icon name="fingerprint" size={16} />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-navy-900 dark:text-graphite-100">{s.device}</div>
                          {s.current && <Badge tone="success" dot className="mt-0.5">This device</Badge>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-sm">{s.location}</div>
                      <div className="text-[11px] font-mono text-graphite-500">{s.ip}</div>
                    </td>
                    <td className="text-sm text-graphite-600">{s.when}</td>
                    <td className="!pr-6 text-right">
                      <span className="text-xs text-graphite-400">—</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-graphite-200 dark:border-graphite-800 text-xs text-graphite-500">
            Session management controls are not yet available in the MVP.
          </div>
        </Card>
      )}

      {tab === 'notifications' && (
        <Card>
          <CardHeader eyebrow="Notifications" title="Channel preferences"
            subtitle="Tune what reaches you, where, and how often." />
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 divide-y md:divide-y-0 md:divide-x divide-graphite-200 dark:divide-graphite-800">
            <div className="md:pr-6 divide-y divide-graphite-200 dark:divide-graphite-800">
              <div className="py-4"><Switch checked={loginAlert} onChange={setLoginAlert}
                label="Sign-in alerts" description="Push & email when a new device signs in." /></div>
              <div className="py-4"><Switch checked={largeTxAlert} onChange={setLargeTxAlert}
                label="Large transaction alerts" description="Notify on outflows over $5,000." /></div>
              <div className="py-4"><Switch checked={pushAlert} onChange={setPushAlert}
                label="Mobile push notifications" description="Real-time push to registered devices." /></div>
            </div>
            <div className="md:pl-6 divide-y divide-graphite-200 dark:divide-graphite-800">
              <div className="py-4"><Switch checked={statementsEmail} onChange={setStatementsEmail}
                label="Monthly e-statements" description="PDF statements on the first business day." /></div>
              <div className="py-4"><Switch checked={marketing} onChange={setMarketing}
                label="Product news" description="Roadmap updates and new offerings — at most once a month." /></div>
              <div className="py-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-navy-900 dark:text-graphite-100">Quiet hours</div>
                  <div className="text-xs text-graphite-500 mt-0.5">Suppress non-critical notifications.</div>
                </div>
                <Badge tone="navy">22:00 – 07:00</Badge>
              </div>
            </div>
          </div>
        </Card>
      )}

      {tab === 'preferences' && (
        <Card>
          <CardHeader eyebrow="Personalisation" title="Display & locale" />
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Theme">
              <Select value={theme} onChange={(e) => setTheme(e.target.value)}>
                <option value="system">Match system</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </Select>
            </Field>
            <Field label="Display currency">
              <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                {['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'KZT'].map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </Field>
            <Field label="Language">
              <Select value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="en-US">English (US)</option>
                <option value="en-GB">English (UK)</option>
                <option value="de">Deutsch</option>
                <option value="fr">Français</option>
                <option value="ja">日本語</option>
              </Select>
            </Field>
          </div>
        </Card>
      )}

    </div>
  );
}
