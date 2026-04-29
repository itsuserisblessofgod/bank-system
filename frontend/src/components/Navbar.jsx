import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

export default function Navbar() {
  const { auth, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-bold text-xl text-brand-600">
          EBMS
        </Link>
        <div className="flex items-center gap-4 text-sm">
          {auth ? (
            <>
              <Link to="/dashboard" className="hover:text-brand-600">Dashboard</Link>
              <Link to="/transactions" className="hover:text-brand-600">Transactions</Link>
              <Link to="/transfer" className="hover:text-brand-600">Transfer</Link>
              {isAdmin && (
                <>
                  <Link to="/admin" className="hover:text-brand-600">Admin</Link>
                  <Link to="/admin/fraud" className="hover:text-brand-600">Fraud</Link>
                </>
              )}
              <span className="text-slate-500">{auth.email}</span>
              <button onClick={handleLogout} className="btn-ghost">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-brand-600">Login</Link>
              <Link to="/register" className="btn-primary">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
