'use client';

import React from 'react';

interface Props {
  price: number;
  interval: 'month' | 'year';
  currency: 'USD' | 'JPY' | 'EUR';
}

export default function StatusPill({ price, interval, currency }: Props) {
  const formatPrice = () => {
    const currencySymbol = {
      USD: '$',
      JPY: '¥',
      EUR: '€'
    }[currency];

    const intervalText = interval === 'month' ? '月' : '年';
    
    if (currency === 'JPY') {
      return `${currencySymbol}${price.toLocaleString()}/${intervalText}`;
    }
    
    return `${currencySymbol}${price}/${intervalText}`;
  };

  return (
    <p className="text-2xl font-bold text-gray-900 mt-2">
      {formatPrice()}
    </p>
  );
}