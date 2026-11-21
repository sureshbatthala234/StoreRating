import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const ChangePassword = () => {
  const { changePassword } = useAuth();

  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.oldPassword) {
      errs.oldPassword = 'Current password is required.';
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/;
    if (!formData.newPassword) {
      errs.newPassword = 'New password is required.';
    } else if (!passwordRegex.test(formData.newPassword)) {
      errs.newPassword =
        'New password must be 8–16 characters with at least one uppercase letter and one special character (!@#$%^&*).';
    }

    if (formData.newPassword !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
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
    setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setGlobalError('');
    setSuccessMsg('');

    try {
      const res = await changePassword(formData.oldPassword, formData.newPassword);
      setSuccessMsg(res.message || 'Password changed successfully.');
      setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        err.message ||
        'Failed to change password.';
      setGlobalError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="form-container card">
        <h2 className="form-title">Change Password</h2>

        {globalError && <div className="global-error">{globalError}</div>}
        {successMsg && <div className="global-success">{successMsg}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="oldPassword">Current Password</label>
            <input
              id="oldPassword"
              name="oldPassword"
              type="password"
              className={`form-control ${errors.oldPassword ? 'error' : ''}`}
              placeholder="••••••••"
              value={formData.oldPassword}
              onChange={handleChange}
              autoComplete="current-password"
            />
            {errors.oldPassword && <span className="error-msg">{errors.oldPassword}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">
              New Password{' '}
              <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
                (8–16 chars, 1 uppercase, 1 special char)
              </span>
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              className={`form-control ${errors.newPassword ? 'error' : ''}`}
              placeholder="••••••••"
              value={formData.newPassword}
              onChange={handleChange}
              autoComplete="new-password"
            />
            {errors.newPassword && <span className="error-msg">{errors.newPassword}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className={`form-control ${errors.confirmPassword ? 'error' : ''}`}
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
            />
            {errors.confirmPassword && <span className="error-msg">{errors.confirmPassword}</span>}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px' }}
            disabled={submitting}
          >
            {submitting ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
