'use client';

import Link from 'next/link';
import { isActive } from '@/app/_utils/navigation/nav-helpers';
import { PublicNavItem } from '@/app/_config/navigation/public/sidebar';
import { usePathname } from 'next/navigation';

interface Props {
  item: PublicNavItem;
  /** 現在パス。渡さない場合は内部で usePathname() 取得 */
  current?: string;
}

export default function NavItem({ item, current }: Props) {
  const currentPathname = usePathname();
  const pathname = current ?? currentPathname;
  const active = isActive(pathname, item.href);

  const base = `px-3 py-2 rounded-md text-sm font-medium transition-colors`;
  const adminClasses = item.adminAccent
    ? active
      ? 'bg-red-100 text-red-700 font-semibold'
      : 'text-red-600 hover:text-red-700 hover:bg-red-50'
    : active
      ? 'bg-blue-100 text-blue-700'
      : 'text-gray-700 hover:text-blue-600';

  return (
    <Link href={item.href} className={`${base} ${adminClasses}`}>
      {item.label}
    </Link>
  );
}
