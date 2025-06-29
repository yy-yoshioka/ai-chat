'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export function TrialBadge({ daysLeft }: { daysLeft: number }) {
  const { id = 'default' } = useParams();

  if (daysLeft <= 0) return null;

  return (
    <Link
      href={`/admin/org/${id}/billing-plans`}
      className="flex items-center px-3 py-1.5 bg-orange-100 hover:bg-orange-200
                 border border-orange-300 rounded-full text-orange-800 text-sm font-medium"
    >
      ⏰ Trial <span className="font-bold mx-1">{daysLeft}</span> days left ▸ Upgrade
    </Link>
  );
}
