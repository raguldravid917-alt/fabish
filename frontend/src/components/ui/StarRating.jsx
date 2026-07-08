/**
 * StarRating — Reusable star display component.
 * Replaces duplicated star rendering in ProductDetail and review lists.
 */
import React from 'react';
import { Star } from 'lucide-react';

/**
 * @param {object} props
 * @param {number} props.rating - Current rating value
 * @param {number} [props.maxStars=5] - Maximum number of stars
 * @param {string} [props.size='w-3.5 h-3.5'] - Star icon size class
 * @param {string} [props.filledColor='text-yellow-400 fill-yellow-400'] - Filled star classes
 * @param {string} [props.emptyColor='text-gray-300'] - Empty star classes
 * @param {string} [props.className] - Additional container classes
 */
const StarRating = ({
  rating,
  maxStars = 5,
  size = 'w-3.5 h-3.5',
  filledColor = 'text-yellow-400 fill-yellow-400',
  emptyColor = 'text-gray-300',
  className = '',
}) => {
  return (
    <div className={`flex gap-0.5 select-none ${className}`}>
      {[...Array(maxStars)].map((_, i) => (
        <Star
          key={i}
          className={`${size} ${i < Math.floor(rating) ? filledColor : emptyColor}`}
        />
      ))}
    </div>
  );
};

export default StarRating;
