'use client';

export default function CurrentBadge() {
  return (
    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
        現在のプラン
      </span>
    </div>
  );
}
