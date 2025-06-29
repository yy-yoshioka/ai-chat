import React from 'react';
import { FAQ_FILTER_ALL_LABEL } from '@/_config/faq/constants';

interface FAQFilterProps {
  categories: string[];
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
}

export function FAQFilter({ categories, categoryFilter, onCategoryFilterChange }: FAQFilterProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">カテゴリフィルター</label>
      <select
        value={categoryFilter}
        onChange={(e) => onCategoryFilterChange(e.target.value)}
        className="w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {categories.map((category) => (
          <option key={category} value={category}>
            {category === 'all' ? FAQ_FILTER_ALL_LABEL : category}
          </option>
        ))}
      </select>
    </div>
  );
}
