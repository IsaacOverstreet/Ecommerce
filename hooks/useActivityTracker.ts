"use client";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef } from "react";

const INACTIVITY_LIMIT = 60 * 1000; // 30 minutes
const CHECK_INTERVAL = 60 * 1000; // check every minute

export function useActivityTracker() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: session, update } = useSession();
  const lastActivityRef = useRef(Date.now());

  useEffect(() => {
    // Update timestamp on any user interaction
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
      update({ lastActivity: Date.now() }); // sync with NextAuth session
    };

    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, updateActivity));

    // Periodically check if user has been inactive
    const interval = setInterval(() => {
      const inactive = Date.now() - lastActivityRef.current > INACTIVITY_LIMIT;
      if (inactive) {
        signOut({ callbackUrl: "/admin/Login" });
      }
    }, CHECK_INTERVAL);

    return () => {
      events.forEach((e) => window.removeEventListener(e, updateActivity));
      clearInterval(interval);
    };
  }, [update]);
}
