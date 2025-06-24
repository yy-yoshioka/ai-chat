'use client';

import React from 'react';
import { useAuth } from '../_hooks/useAuth';
import { Role } from '@/app/_domains/auth';

interface PermissionGateProps {
  children: React.ReactNode;
  orgId?: string;
  requiredRole?: Role;
  requiredResource?: string;
  requiredAction?: string;
  fallback?: React.ReactNode;
}

const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  orgId,
  requiredRole,
  requiredResource,
  requiredAction,
  fallback = <AccessDenied />,
}) => {
  const { user, loading, hasOrgPermission, hasOrgResourcePermission } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return <LoadingScreen />;
  }

  // No user authenticated
  if (!user) {
    return fallback;
  }

  // Check role-based permission
  if (requiredRole && orgId) {
    if (!hasOrgPermission(orgId, requiredRole)) {
      return fallback;
    }
  }

  // Check resource-based permission
  if (requiredResource && requiredAction && orgId) {
    if (!hasOrgResourcePermission(orgId, requiredResource, requiredAction)) {
      return fallback;
    }
  }

  // User has required permissions
  return <>{children}</>;
};

// Default loading screen component
const LoadingScreen: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">認証情報を確認中...</p>
    </div>
  </div>
);

// Default access denied component
const AccessDenied: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center max-w-md mx-auto">
      <div className="mb-6">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-10 h-10 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">アクセス権限がありません</h1>
        <p className="text-gray-600 mb-6">
          このページにアクセスするための適切な権限がありません。 管理者にお問い合わせください。
        </p>
        <button
          onClick={() => window.history.back()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          戻る
        </button>
      </div>
    </div>
  </div>
);

export default PermissionGate;
