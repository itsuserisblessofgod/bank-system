import { Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './layout/AppShell.jsx';
import PrivateRoute from './auth/PrivateRoute.jsx';

import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import TwoFactor from './pages/TwoFactor.jsx';

import Dashboard from './pages/Dashboard.jsx';
import Accounts from './pages/Accounts.jsx';
import Transactions from './pages/Transactions.jsx';
import Transfer from './pages/Transfer.jsx';
import Cards from './pages/Cards.jsx';
import Loans from './pages/Loans.jsx';
import Analytics from './pages/Analytics.jsx';
import Profile from './pages/Profile.jsx';
import Settings from './pages/Settings.jsx';
import Notifications from './pages/Notifications.jsx';

import Admin from './pages/Admin.jsx';
import FraudAlerts from './pages/FraudAlerts.jsx';
import AuditLog from './pages/AuditLog.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/two-factor" element={<TwoFactor />} />

      <Route element={<PrivateRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/transfer" element={<Transfer />} />
          <Route path="/cards" element={<Cards />} />
          <Route path="/loans" element={<Loans />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>
      </Route>

      <Route element={<PrivateRoute role="ROLE_ADMIN" />}>
        <Route element={<AppShell />}>
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/fraud" element={<FraudAlerts />} />
          <Route path="/admin/audit" element={<AuditLog />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
