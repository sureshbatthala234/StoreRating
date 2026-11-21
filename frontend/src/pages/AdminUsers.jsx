import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { StarDisplay } from '../components/StarRating';

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters and sorting
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    address: '',
    role: '',
  });
  const [sortBy, setSortBy] = useState('created_at');
  const [order, setOrder] = useState('desc');

  // Add User Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'user',
  });
  const [formErrors, setFormErrors] = useState({});
  const [creating, setCreating] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (filters.name) params.append('name', filters.name);
      if (filters.email) params.append('email', filters.email);
      if (filters.address) params.append('address', filters.address);
      if (filters.role) params.append('role', filters.role);
      params.append('sortBy', sortBy);
      params.append('order', order);

      const res = await api.get(`/admin/users?${params.toString()}`);
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters, sortBy, order]);

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

  const validateNewUser = () => {
    const errs = {};
    const trimmedName = newUser.name.trim();
    if (!trimmedName) {
      errs.name = 'Name is required.';
    } else if (trimmedName.length < 20 || trimmedName.length > 60) {
      errs.name = `Name must be between 20 and 60 characters (currently ${trimmedName.length}).`;
    }

    if (!newUser.email.trim()) {
      errs.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(newUser.email)) {
      errs.email = 'Valid email is required.';
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/;
    if (!newUser.password) {
      errs.password = 'Password is required.';
    } else if (!passwordRegex.test(newUser.password)) {
      errs.password = 'Password must be 8–16 chars with 1 uppercase letter and 1 special char (!@#$%^&*).';
    }

    if (newUser.address && newUser.address.length > 400) {
      errs.address = 'Address must not exceed 400 characters.';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!validateNewUser()) return;

    setCreating(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.post('/admin/users', newUser);
      if (res.data.success) {
        setSuccess('User created successfully.');
        setNewUser({ name: '', email: '', password: '', address: '', role: 'user' });
        setShowAddForm(false);
        fetchUsers();
      }
    } catch (err) {
      setError(
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.message ||
        'Failed to create user.'
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1>User Management</h1>
        <button
          onClick={() => setShowAddForm((prev) => !prev)}
          className="btn btn-primary"
        >
          {showAddForm ? 'Close Add User Form' : '+ Add New User'}
        </button>
      </div>

      {error && <div className="global-error">{error}</div>}
      {success && <div className="global-success">{success}</div>}

      {showAddForm && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', color: '#1e293b' }}>
            Add New User
          </h2>
          <form onSubmit={handleCreateUser}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div className="form-group">
                <label>Name (20–60 characters) *</label>
                <input
                  type="text"
                  className={`form-control ${formErrors.name ? 'error' : ''}`}
                  placeholder="e.g. Jonathan Alexander Doe"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
                {formErrors.name && <span className="error-msg">{formErrors.name}</span>}
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  className={`form-control ${formErrors.email ? 'error' : ''}`}
                  placeholder="user@example.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
                {formErrors.email && <span className="error-msg">{formErrors.email}</span>}
              </div>

              <div className="form-group">
                <label>Password (8–16 chars, 1 upper, 1 special) *</label>
                <input
                  type="password"
                  className={`form-control ${formErrors.password ? 'error' : ''}`}
                  placeholder="••••••••"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
                {formErrors.password && <span className="error-msg">{formErrors.password}</span>}
              </div>

              <div className="form-group">
                <label>Role *</label>
                <select
                  className="form-control"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                  <option value="user">Normal User</option>
                  <option value="owner">Store Owner</option>
                  <option value="admin">System Admin</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Address (optional, max 400 chars)</label>
              <input
                type="text"
                className={`form-control ${formErrors.address ? 'error' : ''}`}
                placeholder="Residential or business address"
                value={newUser.address}
                onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
              />
              {formErrors.address && <span className="error-msg">{formErrors.address}</span>}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <button type="submit" className="btn btn-primary" disabled={creating}>
                {creating ? 'Saving...' : 'Save User'}
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
            <label>Name</label>
            <input
              type="text"
              name="name"
              className="form-control"
              placeholder="Search name..."
              value={filters.name}
              onChange={handleFilterChange}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="text"
              name="email"
              className="form-control"
              placeholder="Search email..."
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

          <div className="form-group">
            <label>Role</label>
            <select
              name="role"
              className="form-control"
              value={filters.role}
              onChange={handleFilterChange}
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
              <option value="owner">Owner</option>
            </select>
          </div>

          <button
            className="btn btn-secondary btn-sm"
            style={{ height: '38px', marginBottom: '1px' }}
            onClick={() => setFilters({ name: '', email: '', address: '', role: '' })}
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="loading">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="empty-state card">No users found matching your criteria.</div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th
                  className={`sortable ${sortBy === 'name' ? 'sort-active' : ''}`}
                  onClick={() => handleSort('name')}
                >
                  Name
                  <span className="sort-icon">{sortBy === 'name' ? (order === 'asc' ? '▲' : '▼') : '↕'}</span>
                </th>
                <th
                  className={`sortable ${sortBy === 'email' ? 'sort-active' : ''}`}
                  onClick={() => handleSort('email')}
                >
                  Email
                  <span className="sort-icon">{sortBy === 'email' ? (order === 'asc' ? '▲' : '▼') : '↕'}</span>
                </th>
                <th>Address</th>
                <th
                  className={`sortable ${sortBy === 'role' ? 'sort-active' : ''}`}
                  onClick={() => handleSort('role')}
                >
                  Role
                  <span className="sort-icon">{sortBy === 'role' ? (order === 'asc' ? '▲' : '▼') : '↕'}</span>
                </th>
                <th>Store & Rating</th>
                <th
                  className={`sortable ${sortBy === 'created_at' ? 'sort-active' : ''}`}
                  onClick={() => handleSort('created_at')}
                >
                  Registered
                  <span className="sort-icon">{sortBy === 'created_at' ? (order === 'asc' ? '▲' : '▼') : '↕'}</span>
                </th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} onClick={() => navigate(`/admin/users/${u.id}`)}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {u.address || '—'}
                  </td>
                  <td>
                    <span className={`badge badge-${u.role}`}>{u.role}</span>
                  </td>
                  <td>
                    {u.role === 'owner' ? (
                      u.store_name ? (
                        <div>
                          <div>{u.store_name}</div>
                          {u.avg_rating !== null ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
                              <StarDisplay rating={u.avg_rating} />
                              <span>({u.avg_rating})</span>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>No ratings yet</span>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>No store assigned</span>
                      )
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td>
                    <Link
                      to={`/admin/users/${u.id}`}
                      className="btn btn-secondary btn-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
