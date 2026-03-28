"use client";

import { signOut, useSession } from "next-auth/react";
import { useEffect } from "react";

export default function SessionWatcher() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session) return;

    const expires = new Date(session.expires).getTime();
    const now = Date.now();

    const timeLeft = expires - now;

    if (timeLeft <= 0) {
      signOut({ callbackUrl: "/admin/Login" });
    }

    const timer = setTimeout(() => {
      signOut({ callbackUrl: "admin/Login" });
    }, timeLeft);
    return () => clearTimeout(timer);
  }, [session]);
  return null;
}
