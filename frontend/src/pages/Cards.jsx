import { useState } from 'react';
import PageHeader from '../layout/PageHeader.jsx';
import {
  Card, CardHeader, Button, Badge, Switch, Money, Tabs, Field, Input,
  Alert, ProgressBar,
} from '../components/ui/index.jsx';
import Icon from '../components/icons/Icon.jsx';

// Showcase mock data — backend does not yet expose card endpoints.
const MOCK_CARDS = [
  {
    id: 'c-001', label: 'EBMS Platinum', last4: '4119', holder: 'E. R. Sterling',
    expiry: '11/29', network: 'Visa', kind: 'Credit', limit: 50000, balance: 12480.55,
    gradient: 'bg-gradient-card-platinum', tone: 'navy',
  },
  {
    id: 'c-002', label: 'EBMS Obsidian', last4: '8842', holder: 'E. R. Sterling',
    expiry: '04/28', network: 'Mastercard', kind: 'Debit', limit: null, balance: 0,
    gradient: 'bg-gradient-card-obsidian', tone: 'navy',
  },
  {
    id: 'c-003', label: 'EBMS Gold Reserve', last4: '0027', holder: 'Sterling Holdings LLC',
    expiry: '08/30', network: 'Amex', kind: 'Credit', limit: 250000, balance: 41205.00,
    gradient: 'bg-gradient-card-gold text-navy-900', tone: 'gold',
  },
];

function CardVisual({ card, frozen }) {
  return (
    <div className={`relative rounded-2xl p-6 ${card.gradient} text-white shadow-elev-3 ring-1 ring-black/10 overflow-hidden h-56 select-none`}>
      <div className="absolute inset-0 opacity-20 [background:radial-gradient(120%_120%_at_120%_-20%,rgba(255,255,255,0.6),transparent_55%)]" />
      <div className="absolute -right-12 -bottom-12 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
      {frozen && (
        <div className="absolute inset-0 bg-graphite-950/60 backdrop-blur-[2px] flex items-center justify-center text-white">
          <div className="text-center">
            <Icon name="lock" size={26} />
            <div className="mt-2 text-[11px] uppercase tracking-wider">Card frozen</div>
          </div>
        </div>
      )}
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] opacity-80">{card.label}</div>
          <div className="text-[10px] uppercase tracking-wider opacity-70 mt-0.5">{card.kind} · {card.network}</div>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-6 w-9 rounded-md bg-gradient-to-br from-yellow-200/80 to-yellow-500/60 ring-1 ring-white/30" aria-hidden />
          <Icon name="cards" size={20} className="opacity-90" />
        </div>
      </div>

      <div className="relative mt-10 font-mono text-lg tracking-[0.22em] opacity-95">
        •••• •••• •••• {card.last4}
      </div>

      <div className="relative mt-6 flex items-end justify-between text-[11px] uppercase tracking-wider">
        <div>
          <div className="opacity-70">Cardholder</div>
          <div className="font-semibold tracking-normal mt-0.5">{card.holder}</div>
        </div>
        <div>
          <div className="opacity-70">Expires</div>
          <div className="font-mono text-sm mt-0.5">{card.expiry}</div>
        </div>
      </div>
    </div>
  );
}

export default function Cards() {
  const [activeId, setActiveId] = useState(MOCK_CARDS[0].id);
  const card = MOCK_CARDS.find((c) => c.id === activeId);
  const [contactless, setContactless] = useState(true);
  const [online, setOnline] = useState(true);
  const [intl, setIntl] = useState(false);
  const [frozen, setFrozen] = useState(false);
  const [show, setShow] = useState(false);

  const utilization = card.limit ? Math.round((card.balance / card.limit) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Card Programme"
        title="Cards"
        subtitle="Issue, control, and monitor every card on your account. PCI-DSS Level 1 vaulted; sensitive data redacted by default."
        actions={
          <>
            <Button variant="secondary" leftIcon="filter">All cards</Button>
            <Button leftIcon="plus">Request a card</Button>
          </>
        }
      />

      <Tabs
        value={activeId}
        onChange={(v) => { setActiveId(v); setFrozen(false); setShow(false); }}
        items={MOCK_CARDS.map((c) => ({ value: c.id, label: `${c.label} · •${c.last4}`, icon: 'cards' }))}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-1 space-y-4">
          <CardVisual card={card} frozen={frozen} />

          <div className="grid grid-cols-2 gap-3">
            <Button variant={frozen ? 'primary' : 'secondary'} leftIcon={frozen ? 'unlock' : 'lock'} onClick={() => setFrozen((f) => !f)}>
              {frozen ? 'Unfreeze card' : 'Freeze card'}
            </Button>
            <Button variant="secondary" leftIcon={show ? 'eyeOff' : 'eye'} onClick={() => setShow((s) => !s)}>
              {show ? 'Hide details' : 'Reveal details'}
            </Button>
          </div>

          {show && (
            <Alert tone="warning" title="Sensitive details exposed">
              Treat the full PAN, expiry, and CVV as confidential. They will be hidden again in 30 seconds.
              <div className="mt-2 grid grid-cols-2 gap-2 font-mono text-sm text-navy-900">
                <div>PAN: 4929 1834 2240 {card.last4}</div>
                <div>Exp: {card.expiry}</div>
                <div>CVV: •••</div>
                <div>Network: {card.network}</div>
              </div>
            </Alert>
          )}
        </div>

        <div className="xl:col-span-2 space-y-4">
          <Card>
            <CardHeader eyebrow="Limits & balance" title="Spending overview" />
            {card.limit ? (
              <div className="mt-5">
                <div className="flex items-end justify-between">
                  <div>
                    <div className="kpi-label">Balance</div>
                    <div className="kpi-value num mt-1"><Money value={card.balance} /></div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] uppercase tracking-wider text-graphite-500">Credit limit</div>
                    <div className="num font-semibold text-navy-900 dark:text-graphite-100"><Money value={card.limit} /></div>
                  </div>
                </div>
                <div className="mt-4">
                  <ProgressBar value={utilization} label="Utilization" color={utilization > 70 ? 'bg-warning-500' : 'bg-navy-900'} />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                  {[
                    ['Available', card.limit - card.balance],
                    ['Statement', card.balance * 0.7],
                    ['Min. due', card.balance * 0.05],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-xl bg-graphite-50 dark:bg-graphite-900/40 ring-1 ring-graphite-200 dark:ring-graphite-800 px-3.5 py-3">
                      <div className="text-[11px] uppercase tracking-wider text-graphite-500">{k}</div>
                      <div className="num font-semibold text-navy-900 dark:text-graphite-100 mt-1"><Money value={v} /></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-4 text-sm text-graphite-600">Debit card linked to your primary checking account.</div>
            )}
          </Card>

          <Card>
            <CardHeader eyebrow="Controls" title="Card permissions" subtitle="Toggle in real time. Changes propagate to the network within seconds." />
            <div className="mt-4 divide-y divide-graphite-200 dark:divide-graphite-800">
              <div className="py-4">
                <Switch checked={contactless} onChange={setContactless}
                  label="Contactless payments"
                  description="Allow tap-to-pay (NFC) at supported terminals." />
              </div>
              <div className="py-4">
                <Switch checked={online} onChange={setOnline}
                  label="Online & e-commerce"
                  description="Permit card-not-present and digital wallet transactions." />
              </div>
              <div className="py-4">
                <Switch checked={intl} onChange={setIntl}
                  label="International transactions"
                  description="Authorise charges initiated outside the cardholder's home country." />
              </div>
              <div className="py-4">
                <Field label="Per-transaction limit (USD)">
                  <Input type="number" leftIcon="coin" defaultValue={5000} />
                </Field>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
