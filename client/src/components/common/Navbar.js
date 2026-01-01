import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

  if (!user) return null;

  return (
    <nav className="nav">
      <div className="nav-content">
        <Link to="/" className="nav-logo">🏋️ FitTrack</Link>
        <div className="nav-links">
          <Link to="/" className={isActive('/')}>Dashboard</Link>
          <Link to="/meals" className={isActive('/meals')}>Meals</Link>
          <Link to="/progress" className={isActive('/progress')}>Progress</Link>
          <Link to="/profile" className={isActive('/profile')}>Profile</Link>
          <button onClick={logout} className="btn btn-secondary btn-sm">Logout</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
