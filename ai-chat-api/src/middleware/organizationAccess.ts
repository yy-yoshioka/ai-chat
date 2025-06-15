import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

interface AuthenticatedRequest extends Request {
  userId?: string;
}

export interface OrganizationRequest extends AuthenticatedRequest {
  organizationId?: string;
  companyId?: string;
  userRole?: 'admin' | 'member' | 'viewer';
}

/**
 * Middleware to enforce organization-level access control
 * Ensures users can only access resources within their organization
 */
export const requireOrganizationAccess = async (
  req: OrganizationRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId; // From auth middleware

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get user's company and organization
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        company: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!user || !user.company) {
      return res.status(403).json({ error: 'No company association found' });
    }

    // Set organization and company context
    req.organizationId = user.company.organizationId || undefined;
    req.companyId = user.company.id;
    req.userRole = user.isAdmin ? 'admin' : 'member';

    next();
  } catch (error) {
    console.error('Organization access error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Middleware to filter queries by organization
 * Automatically adds organization/company filters to database queries
 */
export const filterByOrganization = (
  req: OrganizationRequest,
  res: Response,
  next: NextFunction
) => {
  // Add organization filter to req.query for automatic filtering
  if (req.organizationId) {
    req.query.organizationId = req.organizationId;
  }

  if (req.companyId) {
    req.query.companyId = req.companyId;
  }

  next();
};

/**
 * Check if user has admin access within their organization
 */
export const requireOrganizationAdmin = (
  req: OrganizationRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.userRole !== 'admin') {
    return res
      .status(403)
      .json({ error: 'Organization admin access required' });
  }
  next();
};

/**
 * Utility function to create organization-scoped Prisma queries
 */
export const createOrganizationFilter = (req: OrganizationRequest) => {
  const filter: Record<string, string | { organizationId: string }> = {};

  if (req.organizationId) {
    filter.company = {
      organizationId: req.organizationId,
    };
  } else if (req.companyId) {
    filter.companyId = req.companyId;
  }

  return filter;
};
