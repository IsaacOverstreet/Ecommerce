import { JWT } from "next-auth/jwt";

export function isAdmin(token: JWT | null): boolean {
  return token?.role === "ADMIN";
}

export function isCustomer(token: JWT | null): boolean {
  return token?.role === "CUSTOMER";
}
