"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Tells the server about each page view (see /api/visit). */
export function VisitBeacon() {
  const pathname = usePathname();
  useEffect(() => {
    fetch("/api/visit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path: pathname }), keepalive: true }).catch(() => {});
  }, [pathname]);
  return null;
}
