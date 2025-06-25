import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/_hooks/auth/useAuth';

// Options for the withAuth HOC
interface WithAuthOptions {
  // Path to redirect to if not authenticated
  redirectTo?: string;
  // Whether to allow the page to render during loading state
  allowLoading?: boolean;
}

// Default options
const defaultOptions: WithAuthOptions = {
  redirectTo: '/login',
  allowLoading: false,
};

/**
 * Higher-Order Component to protect routes that require authentication
 * Redirects to login page if user is not authenticated
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: WithAuthOptions
) {
  // Merge provided options with defaults
  const { redirectTo, allowLoading } = { ...defaultOptions, ...options };

  // Return a new component that wraps the provided component
  const AuthenticatedComponent = (props: P) => {
    const router = useRouter();
    const { authenticated, loading } = useAuth();

    // Redirect to login if not authenticated and not loading
    useEffect(() => {
      if (!loading && !authenticated) {
        // Redirect to login page
        router.replace(redirectTo || '/login');
      }
    }, [authenticated, loading, router]);

    // Show loading state or null depending on allowLoading option
    if (loading) {
      return allowLoading ? <div>Loading...</div> : null;
    }

    // If not authenticated, don't render the page
    if (!authenticated) {
      return null;
    }

    // If authenticated, render the wrapped component
    return <Component {...props} />;
  };

  // Copy display name for better debugging
  const displayName = Component.displayName || Component.name || 'Component';
  AuthenticatedComponent.displayName = `withAuth(${displayName})`;

  return AuthenticatedComponent;
}

/**
 * Usage example:
 *
 * import { withAuth } from '../lib/withAuth';
 *
 * function ProfilePage({ user }) {
 *   return <div>Hello, {user.name}!</div>;
 * }
 *
 * export default withAuth(ProfilePage);
 */
