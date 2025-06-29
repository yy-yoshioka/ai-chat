import Link from 'next/link';

interface AdminTrialBadgeProps {
  orgId: string;
}

export function AdminTrialBadge({ orgId }: AdminTrialBadgeProps) {
  const trialEndDate = new Date();
  trialEndDate.setDate(trialEndDate.getDate() + 7);

  const today = new Date();
  const timeDiff = trialEndDate.getTime() - today.getTime();
  const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

  if (daysLeft <= 0) return null;

  return (
    <Link
      href={`/admin/${orgId}/billing`}
      className="flex items-center px-3 py-1.5 bg-orange-100 hover:bg-orange-200 border border-orange-300 rounded-full text-orange-800 text-sm font-medium transition-colors"
    >
      <span className="mr-1">⏰</span>
      Trial <span className="font-bold mx-1">{daysLeft}</span> days left
      <span className="ml-1">▸ Upgrade</span>
    </Link>
  );
}
