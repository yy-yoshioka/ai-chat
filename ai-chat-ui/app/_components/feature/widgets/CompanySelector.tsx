'use client';

import React from 'react';
import type { Company } from '@/app/_schemas/widget';

interface CompanySelectorProps {
  companies: Company[];
  selectedCompanyId: string;
  onChange: (companyId: string) => void;
}

export function CompanySelector({ companies, selectedCompanyId, onChange }: CompanySelectorProps) {
  return (
    <div className="mb-6">
      <label htmlFor="company-select" className="block text-sm font-medium text-gray-700 mb-2">
        会社を選択
      </label>
      <select
        id="company-select"
        value={selectedCompanyId}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {companies.map((company) => (
          <option key={company.id} value={company.id}>
            {company.name} ({company.plan})
          </option>
        ))}
      </select>
    </div>
  );
}