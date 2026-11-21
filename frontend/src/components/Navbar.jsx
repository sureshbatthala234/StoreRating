import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isOwner, isUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getHomePath = () => {
    if (!isAuthenticated) return '/login';
    if (isAdmin) return '/admin';
    if (isOwner) return '/owner';
    return '/stores';
  };

  return (
    <nav className="navbar">
      <Link to={getHomePath()} className="navbar-brand">
        ★ StoreRating
      </Link>

      <ul className="navbar-links">
        {isAuthenticated && isAdmin && (
          <>
            <li><Link to="/admin">Dashboard</Link></li>
            <li><Link to="/admin/users">Users</Link></li>
            <li><Link to="/admin/stores">Stores</Link></li>
          </>
        )}

        {isAuthenticated && isOwner && (
          <li><Link to="/owner">My Store Dashboard</Link></li>
        )}

        {isAuthenticated && isUser && (
          <li><Link to="/stores">Browse Stores</Link></li>
        )}

        {isAuthenticated && (
          <li><Link to="/change-password">Change Password</Link></li>
        )}

        {!isAuthenticated && (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/signup">Sign Up</Link></li>
          </>
        )}
      </ul>

      {isAuthenticated && user && (
        <div className="navbar-user">
          <span>{user.name}</span>
          <span className={`badge badge-${user.role}`}>{user.role}</span>
          <button onClick={handleLogout} className="btn btn-secondary btn-sm">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
