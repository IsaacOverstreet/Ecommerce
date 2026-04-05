// app/admin/layout.tsx
"use client";
import { SessionProvider } from "next-auth/react";
import { useActivityTracker } from "@/hooks/useActivityTracker";

function AdminContent({ children }: { children: React.ReactNode }) {
  useActivityTracker();
  return <div>{children}</div>;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <AdminContent>{children}</AdminContent>
    </SessionProvider>
  );
}
