import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Transactions from './pages/Transactions.jsx';
import Transfer from './pages/Transfer.jsx';
import Admin from './pages/Admin.jsx';
import FraudAlerts from './pages/FraudAlerts.jsx';
import PrivateRoute from './auth/PrivateRoute.jsx';
import Navbar from './components/Navbar.jsx';

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/transfer" element={<Transfer />} />
          </Route>
          <Route element={<PrivateRoute role="ROLE_ADMIN" />}>
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/fraud" element={<FraudAlerts />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}
