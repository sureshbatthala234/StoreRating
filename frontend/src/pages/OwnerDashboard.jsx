import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { StarDisplay } from '../components/StarRating';

const OwnerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/owner/dashboard');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to load store owner dashboard data.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="loading">Loading store information and customer ratings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-wrapper">
        <div className="global-error">{error}</div>
      </div>
    );
  }

  const { store, raters } = data || {};

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1>{store?.name} — Owner Dashboard</h1>
      </div>

      {/* Prominent Average Rating Display */}
      <div className="owner-avg-rating">
        <h2>{store?.avg_rating !== null ? store?.avg_rating : '—'}</h2>
        {store?.avg_rating !== null && (
          <div className="stars-display">
            <StarDisplay rating={store.avg_rating} />
          </div>
        )}
        <p>
          {store?.avg_rating !== null
            ? `Average Customer Rating based on ${store?.total_ratings} review${store?.total_ratings === 1 ? '' : 's'}`
            : 'No ratings submitted yet for your store.'}
        </p>
      </div>

      {/* Store Information Card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', color: '#1e293b' }}>
          Store Details
        </h2>
        <div className="detail-grid">
          <div className="detail-item">
            <label>Store Name</label>
            <p>{store?.name}</p>
          </div>
          <div className="detail-item">
            <label>Store Email</label>
            <p>{store?.email}</p>
          </div>
          <div className="detail-item">
            <label>Address</label>
            <p>{store?.address || 'Not specified'}</p>
          </div>
          <div className="detail-item">
            <label>Total Customer Reviews</label>
            <p>{store?.total_ratings || 0}</p>
          </div>
        </div>
      </div>

      {/* Customer Ratings Table */}
      <div className="card">
        <div className="page-header" style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.2rem', color: '#1e293b' }}>
            Customer Ratings & Reviews
          </h2>
          <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
            {raters?.length || 0} customer{raters?.length === 1 ? '' : 's'} rated
          </span>
        </div>

        {!raters || raters.length === 0 ? (
          <div className="empty-state">
            No customers have rated your store yet. Ratings will show up here once submitted.
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Customer Email</th>
                  <th>Rating Given</th>
                  <th>Submitted At</th>
                </tr>
              </thead>
              <tbody>
                {raters.map((r, idx) => (
                  <tr key={idx} className="no-hover">
                    <td style={{ fontWeight: 600 }}>{r.name}</td>
                    <td>{r.email}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <StarDisplay rating={r.rating} />
                        <strong>{r.rating} / 5</strong>
                      </div>
                    </td>
                    <td>{new Date(r.submitted_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;
