'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import usePublicMenu from '@/app/_hooks/navigation/usePublicMenu';
import NavItem from '../ui/nav/NavItem';
import OrgSwitcher from '../ui/nav/OrgSwitcher';

export default function Navigation() {
  const pathname = usePathname();
  const menuItems = usePublicMenu();

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* ------------ Left : Logo ------------- */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900">AI Chat</h1>
          </Link>

          {/* ------------ Center : Menu ------------- */}
          <div className="flex items-center space-x-4">
            {menuItems.map((item) => (
              <NavItem key={item.href} item={item} current={pathname} />
            ))}
          </div>

          {/* ------------ Right : Org switcher / Profile ------------- */}
          <div className="flex items-center space-x-4">
            <OrgSwitcher />
          </div>
        </div>
      </div>
    </nav>
  );
}
