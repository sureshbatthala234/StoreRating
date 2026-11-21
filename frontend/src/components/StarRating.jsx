import React, { useState } from 'react';

export const StarDisplay = ({ rating, max = 5 }) => {
  const numRating = Number(rating) || 0;
  const stars = [];

  for (let i = 1; i <= max; i++) {
    if (i <= Math.round(numRating)) {
      stars.push('★');
    } else {
      stars.push('☆');
    }
  }

  return (
    <span className="stars-display" title={`${numRating} / ${max}`}>
      {stars.join('')}
    </span>
  );
};

export const StarRatingInput = ({ value = 0, onChange, disabled = false }) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="star-rating-input">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = (hovered || value) >= star;
        const isHover = hovered >= star;

        return (
          <span
            key={star}
            className={`star ${isFilled ? 'filled' : ''} ${isHover ? 'hovered' : ''}`}
            onClick={() => {
              if (!disabled && onChange) onChange(star);
            }}
            onMouseEnter={() => {
              if (!disabled) setHovered(star);
            }}
            onMouseLeave={() => {
              if (!disabled) setHovered(0);
            }}
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
          >
            ★
          </span>
        );
      })}
    </div>
  );
};
