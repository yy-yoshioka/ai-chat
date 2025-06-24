import { ReactNode } from 'react';
import Navigation from '@/app/_components/layout/Navigation';

interface LayoutProps {
  children: ReactNode;
  showNavigation?: boolean;
}

export default function Layout({ children, showNavigation = true }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {showNavigation && <Navigation />}
      <main>{children}</main>
    </div>
  );
}
