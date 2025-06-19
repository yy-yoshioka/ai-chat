export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'super_admin';
  organizationId?: string;
  organizationName?: string;
  profileImage?: string;
  createdAt?: string;
  updatedAt?: string;
}
