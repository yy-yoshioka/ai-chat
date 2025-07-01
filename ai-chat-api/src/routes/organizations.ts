import express from 'express';
import { authMiddleware as requireAuth } from '../middleware/auth';
import * as organizationService from '../services/organizationService';

const router = express.Router();

// Get user's organizations
router.get('/', requireAuth, async (req, res) => {
  try {
    const organizations = await organizationService.getUserOrganizations(
      req.user!.id
    );

    // Add computed fields
    const enhancedOrgs = organizations.map((org) => ({
      ...org,
      userCount: org._count.users,
      widgetCount: org.companies.reduce(
        (sum, company) => sum + company._count.widgets,
        0
      ),
      plan: org.companies[0]?.plan || 'free', // Use first company's plan as org plan
    }));

    res.json(enhancedOrgs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch organizations' });
  }
});

// Get organization by ID
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const organization = await organizationService.getOrganizationById(
      req.params.id,
      req.user!.id
    );
    res.json(organization);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch organization';
    const status =
      message.includes('not found') || message.includes('access denied')
        ? 404
        : 500;
    res.status(status).json({ error: message });
  }
});

// Update organization
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const organization = await organizationService.updateOrganization(
      req.params.id,
      req.user!.id,
      req.body
    );
    res.json(organization);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to update organization';
    const status =
      message.includes('not found') || message.includes('insufficient')
        ? 403
        : 500;
    res.status(status).json({ error: message });
  }
});

// Get organization stats
router.get('/:id/stats', requireAuth, async (req, res) => {
  try {
    const stats = await organizationService.getOrganizationStats(req.params.id);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch organization stats' });
  }
});

export default router;
