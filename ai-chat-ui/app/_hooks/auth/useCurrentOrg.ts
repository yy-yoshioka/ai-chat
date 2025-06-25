import { useParams, useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';

interface Organization {
  id: string;
  name: string;
  plan: string;
  trialEndDate?: string;
}

export function useCurrentOrg(): {
  orgId: string | null;
  organization: Organization | null;
  isLoading: boolean;
  switchOrg: (newOrgId: string) => void;
} {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();

  // Get orgId from URL params (App Router) or fallback
  const orgId = (params?.orgId as string) || null;

  // Mock organization data - replace with actual API call
  const organization: Organization | null = orgId
    ? {
        id: orgId,
        name: orgId === 'default' ? 'Default Organization' : `Organization ${orgId}`,
        plan: 'pro',
        trialEndDate: '2024-02-01',
      }
    : null;

  const switchOrg = (newOrgId: string) => {
    if (pathname) {
      // Replace current orgId with new one in the path
      const newPath = pathname.replace(`/admin/${orgId}`, `/admin/${newOrgId}`);
      router.push(newPath);
    } else {
      // Fallback to dashboard
      router.push(`/admin/${newOrgId}/dashboard`);
    }
  };

  return {
    orgId,
    organization,
    isLoading: false, // Would be true while fetching org data
    switchOrg,
  };
}

// Helper hook for Pages Router compatibility
export function useCurrentOrgLegacy(): {
  orgId: string;
  organization: Organization | null;
  isLoading: boolean;
} {
  // For Pages Router, we'll use a fallback orgId
  // In a real implementation, you'd get this from user context or local storage
  const orgId = 'default';

  const organization: Organization = {
    id: orgId,
    name: 'Default Organization',
    plan: 'pro',
    trialEndDate: '2024-02-01',
  };

  return {
    orgId,
    organization,
    isLoading: false,
  };
}
