"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RedirectToChat() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/community/groups");
  }, [router]);
  return null;
}
