'use client';

import React from 'react';
import { formatCurrencyJP, formatDateJP } from '@/app/_utils/formatters';

export interface Invoice {
  id: string;
  date: string; // ISO
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  downloadUrl?: string;
}

interface Props {
  orgId: string;
}

export default function InvoiceTab({ orgId }: Props) {
  // モック or SWR で取得
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);

  React.useEffect(() => {
    fetch(`/api/billing/usage?orgId=${orgId}&invoices=1`)
      .then((r) => r.json())
      .then((d) => setInvoices(d.invoices ?? []))
      .catch(() => setInvoices([]));
  }, [orgId]);

  const pill = (st: Invoice['status']) => {
    const map = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
    } as const;
    return map[st];
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">請求書</h3>
      <div className="overflow-x-auto bg-white rounded-lg shadow-sm border">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                #
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                日付
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                金額
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                ステータス
              </th>
              <th />
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{inv.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{formatDateJP(inv.date)}</td>
                <td className="px-6 py-4 whitespace-nowrap">{formatCurrencyJP(inv.amount)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${pill(inv.status)}`}
                  >
                    {inv.status === 'paid'
                      ? '支払済み'
                      : inv.status === 'pending'
                        ? '保留中'
                        : '失敗'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {inv.downloadUrl && (
                    <a
                      href={inv.downloadUrl}
                      className="text-blue-600 hover:text-blue-900"
                      download
                    >
                      ダウンロード
                    </a>
                  )}
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-6 text-center text-gray-500">
                  請求書はまだありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
