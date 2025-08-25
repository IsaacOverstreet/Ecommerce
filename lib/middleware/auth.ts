import { JWT } from "next-auth/jwt";

export function isAuthenticated(token: JWT | null): boolean {
  return !!token;
}
