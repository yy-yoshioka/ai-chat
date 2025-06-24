import { z } from 'zod';

// Trial Extension Request
export const OrgTrialExtensionRequest = z.object({
  orgId: z.string(),
});

export type OrgTrialExtensionRequest = z.infer<typeof OrgTrialExtensionRequest>;

// Trial Extension Response
export const TrialExtensionResponse = z.object({
  success: z.boolean(),
  newTrialEndAt: z.string(),
  message: z.string(),
});

export type TrialExtensionResponse = z.infer<typeof TrialExtensionResponse>;

// Trial Status
export const TrialStatus = z.object({
  isTrialActive: z.boolean(),
  trialStartDate: z.string().optional(),
  trialEndDate: z.string().optional(),
  daysRemaining: z.number().optional(),
  canExtend: z.boolean(),
});

export type TrialStatus = z.infer<typeof TrialStatus>;
