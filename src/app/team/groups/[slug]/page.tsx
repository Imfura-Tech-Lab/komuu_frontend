"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Admin group detail page redirects to unified community groups
// Chat is handled by the floating chat widget
export default function RedirectToGroups() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/community/groups");
  }, [router]);
  return null;
}
