import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { StarDisplay } from '../components/StarRating';

const AdminUserDetail = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/admin/users/${id}`);
        if (res.data.success) {
          setUser(res.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load user details.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  return (
    <div className="page-wrapper">
      <Link to="/admin/users" className="back-link">
        ← Back to Users List
      </Link>

      {error && <div className="global-error">{error}</div>}

      {loading ? (
        <div className="loading">Loading user details...</div>
      ) : user ? (
        <div className="card">
          <div className="page-header" style={{ marginBottom: '16px' }}>
            <h1>{user.name}</h1>
            <span className={`badge badge-${user.role}`}>{user.role}</span>
          </div>

          <div className="detail-grid">
            <div className="detail-item">
              <label>User ID</label>
              <p>#{user.id}</p>
            </div>

            <div className="detail-item">
              <label>Email Address</label>
              <p>{user.email}</p>
            </div>

            <div className="detail-item">
              <label>Physical Address</label>
              <p>{user.address || 'Not provided'}</p>
            </div>

            <div className="detail-item">
              <label>Account Created</label>
              <p>{new Date(user.created_at).toLocaleString()}</p>
            </div>

            {user.role === 'owner' && (
              <>
                <div className="detail-item" style={{ gridColumn: '1 / -1', borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginTop: '8px' }}>
                  <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '12px' }}>
                    Owned Store Information
                  </h3>
                </div>

                {user.store_name ? (
                  <>
                    <div className="detail-item">
                      <label>Store Name</label>
                      <p>{user.store_name} (ID: #{user.store_id})</p>
                    </div>

                    <div className="detail-item">
                      <label>Store Email</label>
                      <p>{user.store_email || '—'}</p>
                    </div>

                    <div className="detail-item">
                      <label>Store Address</label>
                      <p>{user.store_address || '—'}</p>
                    </div>

                    <div className="detail-item">
                      <label>Store Overall Rating</label>
                      <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {user.avg_rating !== null ? (
                          <>
                            <StarDisplay rating={user.avg_rating} />
                            <strong>{user.avg_rating} / 5</strong>
                          </>
                        ) : (
                          'No ratings recorded yet'
                        )}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                    <p style={{ color: '#64748b' }}>No store is currently associated with this owner account.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdminUserDetail;
