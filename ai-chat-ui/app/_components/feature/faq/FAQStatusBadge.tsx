import React from 'react';
import { FAQ_STATUS_STYLES, FAQ_STATUS_LABELS } from '@/_config/faq/constants';

interface FAQStatusBadgeProps {
  isActive: boolean;
}

export function FAQStatusBadge({ isActive }: FAQStatusBadgeProps) {
  const status = isActive ? 'active' : 'inactive';
  return (
    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${FAQ_STATUS_STYLES[status]}`}>
      {FAQ_STATUS_LABELS[status]}
    </span>
  );
}