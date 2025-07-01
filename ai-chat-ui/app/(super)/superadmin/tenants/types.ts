export interface Tenant {
  id: string;
  name: string;
  plan: string;
  userCount: number;
  messageCount: number;
  storageUsed: number; // GB
  createdAt: string;
  lastActive: string;
  status: 'active' | 'suspended' | 'trial' | 'inactive';
  trialEndDate?: string;
}
