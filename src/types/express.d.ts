import { UserRole } from "@/constants/user-role";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
      };
      validatedQuery?: unknown;
      rawBody?: Buffer;
    }
  }
}

export {};
