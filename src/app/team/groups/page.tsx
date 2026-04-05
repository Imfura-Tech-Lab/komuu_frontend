"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Admin groups page redirects to unified community groups
export default function RedirectToGroups() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/community/groups");
  }, [router]);
  return null;
}
