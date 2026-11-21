import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { StarDisplay } from '../components/StarRating';

const AdminStores = () => {
  const [stores, setStores] = useState([]);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters and sorting
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    address: '',
  });
  const [sortBy, setSortBy] = useState('created_at');
  const [order, setOrder] = useState('desc');

  // Add Store Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStore, setNewStore] = useState({
    name: '',
    email: '',
    address: '',
    owner_id: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [creating, setCreating] = useState(false);

  const fetchStores = async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (filters.name) params.append('name', filters.name);
      if (filters.email) params.append('email', filters.email);
      if (filters.address) params.append('address', filters.address);
      params.append('sortBy', sortBy);
      params.append('order', order);

      const res = await api.get(`/admin/stores?${params.toString()}`);
      if (res.data.success) {
        setStores(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch stores.');
    } finally {
      setLoading(false);
    }
  };

  const fetchOwners = async () => {
    try {
      const res = await api.get('/admin/users?role=owner');
      if (res.data.success) {
        setOwners(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load store owners list', err);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [filters, sortBy, order]);

  useEffect(() => {
    fetchOwners();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setOrder('asc');
    }
  };

  const validateNewStore = () => {
    const errs = {};
    const trimmedName = newStore.name.trim();
    if (!trimmedName) {
      errs.name = 'Store name is required.';
    } else if (trimmedName.length > 60) {
      errs.name = 'Store name must not exceed 60 characters.';
    }

    if (!newStore.email.trim()) {
      errs.email = 'Store email is required.';
    } else if (!/\S+@\S+\.\S+/.test(newStore.email)) {
      errs.email = 'Valid store email is required.';
    }

    if (newStore.address && newStore.address.length > 400) {
      errs.address = 'Address must not exceed 400 characters.';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    if (!validateNewStore()) return;

    setCreating(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        name: newStore.name.trim(),
        email: newStore.email.trim(),
        address: newStore.address.trim() || undefined,
        owner_id: newStore.owner_id ? parseInt(newStore.owner_id, 10) : undefined,
      };

      const res = await api.post('/admin/stores', payload);
      if (res.data.success) {
        setSuccess('Store created successfully.');
        setNewStore({ name: '', email: '', address: '', owner_id: '' });
        setShowAddForm(false);
        fetchStores();
      }
    } catch (err) {
      setError(
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.message ||
        'Failed to create store.'
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1>Store Management</h1>
        <button
          onClick={() => {
            setShowAddForm((prev) => !prev);
            if (!showAddForm) fetchOwners();
          }}
          className="btn btn-primary"
        >
          {showAddForm ? 'Close Add Store Form' : '+ Add New Store'}
        </button>
      </div>

      {error && <div className="global-error">{error}</div>}
      {success && <div className="global-success">{success}</div>}

      {showAddForm && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', color: '#1e293b' }}>
            Add New Store
          </h2>
          <form onSubmit={handleCreateStore}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div className="form-group">
                <label>Store Name (max 60 chars) *</label>
                <input
                  type="text"
                  className={`form-control ${formErrors.name ? 'error' : ''}`}
                  placeholder="e.g. Downtown Book Emporium"
                  value={newStore.name}
                  onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                />
                {formErrors.name && <span className="error-msg">{formErrors.name}</span>}
              </div>

              <div className="form-group">
                <label>Store Email *</label>
                <input
                  type="email"
                  className={`form-control ${formErrors.email ? 'error' : ''}`}
                  placeholder="store@example.com"
                  value={newStore.email}
                  onChange={(e) => setNewStore({ ...newStore, email: e.target.value })}
                />
                {formErrors.email && <span className="error-msg">{formErrors.email}</span>}
              </div>

              <div className="form-group">
                <label>Store Owner (optional)</label>
                <select
                  className="form-control"
                  value={newStore.owner_id}
                  onChange={(e) => setNewStore({ ...newStore, owner_id: e.target.value })}
                >
                  <option value="">No Owner Assigned</option>
                  {owners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.name} ({owner.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Store Address (optional, max 400 chars)</label>
              <input
                type="text"
                className={`form-control ${formErrors.address ? 'error' : ''}`}
                placeholder="Store street address or location"
                value={newStore.address}
                onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
              />
              {formErrors.address && <span className="error-msg">{formErrors.address}</span>}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <button type="submit" className="btn btn-primary" disabled={creating}>
                {creating ? 'Saving Store...' : 'Save Store'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Bar */}
      <div className="card" style={{ padding: '16px' }}>
        <div className="filter-bar">
          <div className="form-group">
            <label>Store Name</label>
            <input
              type="text"
              name="name"
              className="form-control"
              placeholder="Search store name..."
              value={filters.name}
              onChange={handleFilterChange}
            />
          </div>

          <div className="form-group">
            <label>Store Email</label>
            <input
              type="text"
              name="email"
              className="form-control"
              placeholder="Search store email..."
              value={filters.email}
              onChange={handleFilterChange}
            />
          </div>

          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              name="address"
              className="form-control"
              placeholder="Search address..."
              value={filters.address}
              onChange={handleFilterChange}
            />
          </div>

          <button
            className="btn btn-secondary btn-sm"
            style={{ height: '38px', marginBottom: '1px' }}
            onClick={() => setFilters({ name: '', email: '', address: '' })}
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Stores Table */}
      {loading ? (
        <div className="loading">Loading stores...</div>
      ) : stores.length === 0 ? (
        <div className="empty-state card">No stores found matching your criteria.</div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th
                  className={`sortable ${sortBy === 'name' ? 'sort-active' : ''}`}
                  onClick={() => handleSort('name')}
                >
                  Store Name
                  <span className="sort-icon">{sortBy === 'name' ? (order === 'asc' ? '▲' : '▼') : '↕'}</span>
                </th>
                <th
                  className={`sortable ${sortBy === 'email' ? 'sort-active' : ''}`}
                  onClick={() => handleSort('email')}
                >
                  Email
                  <span className="sort-icon">{sortBy === 'email' ? (order === 'asc' ? '▲' : '▼') : '↕'}</span>
                </th>
                <th
                  className={`sortable ${sortBy === 'address' ? 'sort-active' : ''}`}
                  onClick={() => handleSort('address')}
                >
                  Address
                  <span className="sort-icon">{sortBy === 'address' ? (order === 'asc' ? '▲' : '▼') : '↕'}</span>
                </th>
                <th>Owner</th>
                <th>Total Ratings</th>
                <th
                  className={`sortable ${sortBy === 'avg_rating' ? 'sort-active' : ''}`}
                  onClick={() => handleSort('avg_rating')}
                >
                  Average Rating
                  <span className="sort-icon">{sortBy === 'avg_rating' ? (order === 'asc' ? '▲' : '▼') : '↕'}</span>
                </th>
                <th
                  className={`sortable ${sortBy === 'created_at' ? 'sort-active' : ''}`}
                  onClick={() => handleSort('created_at')}
                >
                  Added Date
                  <span className="sort-icon">{sortBy === 'created_at' ? (order === 'asc' ? '▲' : '▼') : '↕'}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {stores.map((s) => (
                <tr key={s.id} className="no-hover">
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td>{s.email}</td>
                  <td>{s.address || '—'}</td>
                  <td>
                    {s.owner_name ? (
                      <div>
                        <div>{s.owner_name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{s.owner_email}</div>
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>Unassigned</span>
                    )}
                  </td>
                  <td>{s.total_ratings}</td>
                  <td>
                    {s.avg_rating !== null ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <StarDisplay rating={s.avg_rating} />
                        <strong>{s.avg_rating}</strong>
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>Not rated</span>
                    )}
                  </td>
                  <td>{new Date(s.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminStores;
