import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/dashboard');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1>Administrator Dashboard</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/admin/users" className="btn btn-secondary">
            Manage Users
          </Link>
          <Link to="/admin/stores" className="btn btn-primary">
            Manage Stores
          </Link>
        </div>
      </div>

      {error && <div className="global-error">{error}</div>}

      {loading ? (
        <div className="loading">Loading dashboard metrics...</div>
      ) : stats ? (
        <>
          <div className="stat-cards">
            <div className="stat-card">
              <h3>{stats.totalUsers}</h3>
              <p>Total Registered Users</p>
            </div>
            <div className="stat-card">
              <h3>{stats.totalStores}</h3>
              <p>Total Registered Stores</p>
            </div>
            <div className="stat-card">
              <h3>{stats.totalRatings}</h3>
              <p>Total Ratings Submitted</p>
            </div>
          </div>

          <div className="card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '12px', color: '#1e293b' }}>
              Quick Navigation
            </h2>
            <p style={{ color: '#64748b', marginBottom: '20px' }}>
              As an administrator, you have full control over user accounts and store listings.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link to="/admin/users" className="btn btn-primary">
                View & Add Users
              </Link>
              <Link to="/admin/stores" className="btn btn-secondary">
                View & Add Stores
              </Link>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default AdminDashboard;
