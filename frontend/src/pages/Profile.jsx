import { useState } from 'react';
import PageHeader from '../layout/PageHeader.jsx';
import {
  Card, CardHeader, Button, Field, Input, Select, Avatar, Badge, Money,
  Tabs, ProgressBar, Alert,
} from '../components/ui/index.jsx';
import Icon from '../components/icons/Icon.jsx';
import { useAuth } from '../auth/AuthContext.jsx';

const COUNTRIES = [
  ['US', 'United States'], ['GB', 'United Kingdom'], ['DE', 'Germany'], ['FR', 'France'],
  ['KZ', 'Kazakhstan'], ['JP', 'Japan'], ['BR', 'Brazil'], ['IN', 'India'],
];

export default function Profile() {
  const { auth } = useAuth();
  const [tab, setTab] = useState('personal');
  const [form, setForm] = useState({
    fullName: auth?.fullName || '',
    email: auth?.email || '',
    phone: '',
    country: auth?.countryCode || 'US',
    address1: '',
    city: '',
    postal: '',
    dob: '',
    employer: '',
    title: '',
    income: '',
    occupation: '',
  });
  const setF = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Account"
        title="Profile & KYC"
        subtitle="Manage personal information, verification status, and beneficial ownership records."
        actions={<Button variant="secondary" leftIcon="download" disabled style={{opacity: 0.5, pointerEvents: 'none'}} title="Coming soon">Download data</Button>}
      />

      <Alert tone="info" title="Profile editing not available">
        Profile editing is not yet available. Contact support to update your information.
      </Alert>

      {/* Identity panel */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex items-center gap-4">
            <Avatar name={form.fullName} size={64} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-navy-900 dark:text-graphite-50">{form.fullName}</h2>
                <Badge tone="success" dot>Verified</Badge>
                <Badge tone="navy">Tier 3 · Premium</Badge>
              </div>
              <div className="text-sm text-graphite-500 mt-1">{form.email} · {form.country}</div>
              <div className="text-xs text-graphite-400 mt-0.5">Client since {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</div>
            </div>
          </div>
          <div className="md:ml-auto grid grid-cols-3 gap-4 md:gap-6">
            {[
              ['Identity', 100],
              ['Address', 100],
              ['Income', 80],
            ].map(([label, pct]) => (
              <div key={label} className="min-w-[120px]">
                <div className="text-[11px] uppercase tracking-wider text-graphite-500">{label}</div>
                <div className="mt-1.5"><ProgressBar value={pct} /></div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Tabs value={tab} onChange={setTab} items={[
        { value: 'personal', label: 'Personal info', icon: 'user' },
        { value: 'kyc', label: 'KYC & documents', icon: 'shieldCheck' },
        { value: 'tax', label: 'Tax & compliance', icon: 'audit' },
        { value: 'beneficiaries', label: 'Beneficiaries', icon: 'users' },
      ]} />

      {tab === 'personal' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Card className="xl:col-span-2">
            <CardHeader eyebrow="Identity" title="Personal details" />
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Legal full name"><Input leftIcon="user" value={form.fullName} onChange={setF('fullName')} /></Field>
              <Field label="Date of birth"><Input type="date" leftIcon="calendar" value={form.dob} onChange={setF('dob')} /></Field>
              <Field label="Email"><Input type="email" leftIcon="mail" value={form.email} onChange={setF('email')} /></Field>
              <Field label="Phone"><Input leftIcon="phone" value={form.phone} onChange={setF('phone')} /></Field>
              <Field label="Country"><Select value={form.country} onChange={setF('country')}>
                {COUNTRIES.map(([c, n]) => <option key={c} value={c}>{n} ({c})</option>)}
              </Select></Field>
              <Field label="Postal code"><Input leftIcon="location" value={form.postal} onChange={setF('postal')} /></Field>
              <Field label="Street address" className="md:col-span-2"><Input leftIcon="location" value={form.address1} onChange={setF('address1')} /></Field>
              <Field label="City"><Input value={form.city} onChange={setF('city')} /></Field>
            </div>
            <div className="mt-6 flex items-center justify-end gap-2">
              <Button variant="ghost" disabled style={{opacity: 0.5, pointerEvents: 'none'}}>Discard</Button>
              <Button leftIcon="check" disabled style={{opacity: 0.5, pointerEvents: 'none'}} title="Coming soon">Save changes</Button>
            </div>
          </Card>

          <Card>
            <CardHeader eyebrow="Employment" title="Income & occupation" subtitle="Used for credit underwriting and AML profiling." />
            <div className="mt-5 space-y-4">
              <Field label="Employer"><Input value={form.employer} onChange={setF('employer')} /></Field>
              <Field label="Title"><Input value={form.title} onChange={setF('title')} /></Field>
              <Field label="Occupation"><Input value={form.occupation} onChange={setF('occupation')} /></Field>
              <Field label="Annual income (USD)" hint="Encrypted at rest. Visible only to underwriting and compliance.">
                <Input leftIcon="coin" type="number" value={form.income} onChange={setF('income')} />
              </Field>
              <div className="rounded-xl bg-graphite-50 dark:bg-graphite-900/40 ring-1 ring-graphite-200 dark:ring-graphite-800 px-3.5 py-3 text-xs">
                <div className="flex justify-between"><span className="text-graphite-500">Reported income</span><span className="num font-medium"><Money value={form.income} /></span></div>
                <div className="flex justify-between mt-1"><span className="text-graphite-500">Bracket</span><span className="font-medium">High net worth</span></div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {tab === 'kyc' && (
        <Card>
          <CardHeader eyebrow="KYC" title="Identity verification documents" subtitle="Encrypted with envelope keys. Retained per regulatory schedule." />
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              ['Government ID', 'Verified', 'success'],
              ['Proof of address', 'Verified', 'success'],
              ['Selfie / liveness', 'Verified', 'success'],
              ['Source of funds', 'Pending review', 'warning'],
              ['PEP screening', 'Cleared', 'success'],
              ['Sanctions list', 'Cleared', 'success'],
            ].map(([k, v, tone]) => (
              <div key={k} className="rounded-xl ring-1 ring-graphite-200 dark:ring-graphite-800 px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-navy-900 dark:text-graphite-100">{k}</div>
                  <div className="text-[11px] text-graphite-500 mt-0.5">Last updated · {new Date().toLocaleDateString()}</div>
                </div>
                <Badge tone={tone} dot>{v}</Badge>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center gap-3">
            <Button leftIcon="upload" variant="secondary" disabled style={{opacity: 0.5, pointerEvents: 'none'}} title="Coming soon">Upload document</Button>
            <Button leftIcon="refresh" variant="ghost" disabled style={{opacity: 0.5, pointerEvents: 'none'}} title="Coming soon">Re-run screening</Button>
          </div>
        </Card>
      )}

      {tab === 'tax' && (
        <Card>
          <CardHeader eyebrow="Tax & FATCA" title="Tax residency and filings" subtitle="This section is not yet connected to live data." />
          <Alert tone="info" className="mt-4">Tax information editing is not yet available. Contact compliance support.</Alert>
        </Card>
      )}

      {tab === 'beneficiaries' && (
        <Card>
          <CardHeader eyebrow="Estate" title="Beneficiaries & POA"
            subtitle="This section is not yet connected to live data." />
          <Alert tone="info" className="mt-4">Beneficiary management is not yet available. Contact support to add beneficiaries.</Alert>
        </Card>
      )}
    </div>
  );
}
