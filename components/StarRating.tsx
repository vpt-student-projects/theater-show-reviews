'use client';

import { Dispatch, SetStateAction } from 'react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  onRatingChange?: Dispatch<SetStateAction<number>>;
}

const StarRating = ({ rating = 0, maxRating = 10, onRatingChange }: StarRatingProps) => {
  const filledStars = Math.round((rating / maxRating) * 5);
  const emptyStars = 5 - filledStars;

  const handleStarClick = (newRating: number) => {
    if (onRatingChange) {
      // Преобразуем рейтинг из 5-звездочной шкалы обратно в maxRating шкалу
      const scaledRating = Math.round((newRating / 5) * maxRating);
      onRatingChange(scaledRating);
    }
  };

  return (
    <div className="flex items-center gap-1 text-2xl leading-none">
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        return (
          <button
            key={starValue}
            type="button"
            onClick={() => handleStarClick(starValue)}
            className={`${
              starValue <= filledStars ? 'text-yellow-400' : 'text-gray-600 opacity-50'
            } ${onRatingChange ? 'cursor-pointer hover:text-yellow-300' : 'cursor-default'}`}
            disabled={!onRatingChange}
          >
            ★
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;