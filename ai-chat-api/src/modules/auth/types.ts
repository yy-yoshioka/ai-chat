export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  isAdmin: boolean;
  organizationId: string | null;
  companyId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface JWTPayload {
  id: string;
  email: string;
  isAdmin: boolean;
}

export interface AuthResponse {
  message: string;
  user: AuthUser;
}
