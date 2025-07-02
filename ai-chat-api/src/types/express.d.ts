import { UserPayload } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload & { 
        roles?: string[];
        organizationId?: string;
      };
      organizationId?: string;
    }
  }
}

export {};