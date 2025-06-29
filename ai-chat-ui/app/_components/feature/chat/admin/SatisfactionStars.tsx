import React from 'react';

interface SatisfactionStarsProps {
  rating?: number;
}

export function SatisfactionStars({ rating }: SatisfactionStarsProps) {
  if (!rating) return <span className="text-gray-400">未評価</span>;
  
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}>
          ★
        </span>
      ))}
      <span className="ml-1 text-sm text-gray-600">({rating})</span>
    </div>
  );
}