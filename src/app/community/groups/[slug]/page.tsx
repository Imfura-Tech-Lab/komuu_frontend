"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Group detail pages now handled by the groups listing page sheet + chat widget
export default function RedirectToGroups() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/community/groups");
  }, [router]);
  return null;
}
