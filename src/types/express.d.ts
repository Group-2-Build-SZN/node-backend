import { UserRole } from "@/constants/user-role";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole | null;
      };
      validatedQuery?: unknown;
      rawBody?: Buffer;
    }
  }
}

export {};
