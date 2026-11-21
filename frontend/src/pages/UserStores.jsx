import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { StarDisplay, StarRatingInput } from '../components/StarRating';

const UserStores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  // Search filters
  const [filters, setFilters] = useState({
    name: '',
    address: '',
  });

  // Track rating selections in progress per store: { [storeId]: selectedRating }
  const [selectedRatings, setSelectedRatings] = useState({});
  const [submittingStoreId, setSubmittingStoreId] = useState(null);

  const fetchStores = async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (filters.name) params.append('name', filters.name);
      if (filters.address) params.append('address', filters.address);

      const res = await api.get(`/stores?${params.toString()}`);
      if (res.data.success) {
        setStores(res.data.data);

        // Pre-fill selected ratings with my_rating
        const initialRatings = {};
        res.data.data.forEach((s) => {
          if (s.my_rating) {
            initialRatings[s.id] = s.my_rating;
          }
        });
        setSelectedRatings(initialRatings);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch stores.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [filters]);

  const handleRatingSelect = (storeId, rating) => {
    setSelectedRatings((prev) => ({ ...prev, [storeId]: rating }));
  };

  const handleRatingSubmit = async (storeId) => {
    const rating = selectedRatings[storeId];
    if (!rating) return;

    setSubmittingStoreId(storeId);
    setError('');
    setSuccessNotice('');

    try {
      const res = await api.post(`/stores/${storeId}/ratings`, { rating });
      if (res.data.success) {
        setSuccessNotice(`Your rating of ${rating} stars was successfully saved!`);

        // Update local state without full refetch
        setStores((prev) =>
          prev.map((s) =>
            s.id === storeId
              ? {
                  ...s,
                  my_rating: rating,
                  avg_rating: res.data.data.avg_rating,
                  total_ratings:
                    s.my_rating === null ? s.total_ratings + 1 : s.total_ratings,
                }
              : s
          )
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.message ||
        'Failed to submit rating.'
      );
    } finally {
      setSubmittingStoreId(null);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1>Browse & Rate Stores</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
            Explore registered stores, see community ratings, and submit or modify your own rating.
          </p>
        </div>
      </div>

      {error && <div className="global-error">{error}</div>}
      {successNotice && <div className="global-success">{successNotice}</div>}

      {/* Filter / Search Bar */}
      <div className="card" style={{ padding: '16px' }}>
        <div className="filter-bar">
          <div className="form-group">
            <label>Store Name</label>
            <input
              type="text"
              name="name"
              className="form-control"
              placeholder="Search by store name..."
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Address / Location</label>
            <input
              type="text"
              name="address"
              className="form-control"
              placeholder="Search by location..."
              value={filters.address}
              onChange={(e) => setFilters({ ...filters, address: e.target.value })}
            />
          </div>

          <button
            className="btn btn-secondary btn-sm"
            style={{ height: '38px', marginBottom: '1px' }}
            onClick={() => setFilters({ name: '', address: '' })}
          >
            Clear Search
          </button>
        </div>
      </div>

      {/* Store Cards Grid */}
      {loading ? (
        <div className="loading">Searching available stores...</div>
      ) : stores.length === 0 ? (
        <div className="empty-state card">
          No stores found matching your search. Try different search terms!
        </div>
      ) : (
        <div className="store-cards">
          {stores.map((store) => {
            const currentSelected = selectedRatings[store.id] || 0;
            const hasChanged =
              store.my_rating === null
                ? currentSelected > 0
                : currentSelected !== store.my_rating;

            return (
              <div key={store.id} className="store-card">
                <div>
                  <h3>{store.name}</h3>
                  <p className="store-address">{store.address || 'Address not listed'}</p>
                </div>

                <div className="store-rating-row">
                  <StarDisplay rating={store.avg_rating || 0} />
                  <span>
                    <strong>{store.avg_rating !== null ? store.avg_rating : 'No ratings'}</strong>{' '}
                    ({store.total_ratings} review{store.total_ratings === 1 ? '' : 's'})
                  </span>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                  <div style={{ fontSize: '0.825rem', color: '#64748b', marginBottom: '6px' }}>
                    {store.my_rating !== null ? (
                      <span>
                        Your submitted rating: <strong>{store.my_rating} / 5</strong>
                      </span>
                    ) : (
                      <span>You haven't rated this store yet.</span>
                    )}
                  </div>

                  <div className="rating-submit-row">
                    <StarRatingInput
                      value={currentSelected}
                      onChange={(rating) => handleRatingSelect(store.id, rating)}
                      disabled={submittingStoreId === store.id}
                    />

                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleRatingSubmit(store.id)}
                      disabled={!hasChanged || submittingStoreId === store.id}
                    >
                      {submittingStoreId === store.id
                        ? 'Saving...'
                        : store.my_rating !== null
                        ? 'Update Rating'
                        : 'Submit Rating'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserStores;
