"use client";

import { SessionProvider } from "next-auth/react";
import SessionWatcher from "./sessionWatcher";
export default function AdminSessionWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <SessionWatcher />
      {children}
    </SessionProvider>
  );
}
