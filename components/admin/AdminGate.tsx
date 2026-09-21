"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { currentUser } from "@/lib/store";
import { fraunces } from "./fonts";

export default function AdminGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const user = currentUser();
    if (!user || user.role !== "admin") {
      router.replace("/admin/login");
    } else {
      setAllowed(true);
    }
  }, [router]);

  if (!allowed) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#E4572E]" aria-label="Loading" />
        <p className={`${fraunces.className} text-lg text-[#A39A89]`}>Opening mission control…</p>
      </div>
    );
  }

  return <>{children}</>;
}
