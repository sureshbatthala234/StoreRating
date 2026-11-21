import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="page-wrapper" style={{ textAlign: 'center', marginTop: '60px' }}>
      <div className="card" style={{ maxWidth: '480px', margin: '0 auto', padding: '40px' }}>
        <h1 style={{ fontSize: '3rem', color: '#1e40af', marginBottom: '8px' }}>404</h1>
        <h2 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '16px' }}>
          Page Not Found
        </h2>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>
          The page you are looking for doesn't exist or you don't have permission to access it.
        </p>
        <Link to="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
