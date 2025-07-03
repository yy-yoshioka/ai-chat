import { UserPayload } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
      organizationId?: string;
    }
  }
}

export {};
