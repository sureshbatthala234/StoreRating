import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
  });

  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const errs = {};
    const trimmedName = formData.name.trim();

    if (!trimmedName) {
      errs.name = 'Name is required.';
    } else if (trimmedName.length < 20 || trimmedName.length > 60) {
      errs.name = `Name must be between 20 and 60 characters (currently ${trimmedName.length}).`;
    }

    if (!formData.email.trim()) {
      errs.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Enter a valid email address.';
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/;
    if (!formData.password) {
      errs.password = 'Password is required.';
    } else if (!passwordRegex.test(formData.password)) {
      errs.password =
        'Password must be 8–16 characters with at least one uppercase letter and one special character (!@#$%^&*).';
    }

    if (formData.address && formData.address.length > 400) {
      errs.address = 'Address must not exceed 400 characters.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setGlobalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setGlobalError('');

    try {
      await signup(formData);
      navigate('/stores');
    } catch (err) {
      const msg =
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.message ||
        err.message ||
        'Registration failed.';
      setGlobalError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="form-container card">
        <h2 className="form-title">Create a New Account</h2>

        {globalError && <div className="global-error">{globalError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name">
              Full Name <span style={{ color: '#64748b', fontSize: '0.8rem' }}>(20–60 characters)</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className={`form-control ${errors.name ? 'error' : ''}`}
              placeholder="e.g. Jonathan Alexander Doe"
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
            />
            {errors.name ? (
              <span className="error-msg">{errors.name}</span>
            ) : (
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Characters: {formData.name.trim().length}/60
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              className={`form-control ${errors.email ? 'error' : ''}`}
              placeholder="user@example.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />
            {errors.email && <span className="error-msg">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Password{' '}
              <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
                (8–16 chars, 1 uppercase, 1 special char)
              </span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className={`form-control ${errors.password ? 'error' : ''}`}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
            />
            {errors.password && <span className="error-msg">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="address">
              Address <span style={{ color: '#64748b', fontSize: '0.8rem' }}>(optional, max 400 chars)</span>
            </label>
            <textarea
              id="address"
              name="address"
              rows={3}
              className={`form-control ${errors.address ? 'error' : ''}`}
              placeholder="123 Main Street, City, Country"
              value={formData.address}
              onChange={handleChange}
            />
            {errors.address && <span className="error-msg">{errors.address}</span>}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px' }}
            disabled={submitting}
          >
            {submitting ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="form-footer">
          Already have an account? <Link to="/login">Sign in here</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
