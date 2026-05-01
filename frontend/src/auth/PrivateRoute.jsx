import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

export default function PrivateRoute({ role }) {
  const { auth } = useAuth();
  const location = useLocation();
  if (!auth) return <Navigate to="/login" replace />;
  if (auth.requiresTwoFactor && location.pathname !== '/two-factor') {
    return (
      <Navigate
        to="/two-factor"
        replace
        state={{ challengeId: auth.challengeId, remember: auth.remember }}
      />
    );
  }
  if (!auth.requiresTwoFactor && location.pathname === '/two-factor') {
    return <Navigate to="/dashboard" replace />;
  }
  if (role && auth.role !== role) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
