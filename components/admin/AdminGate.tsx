"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { currentUser } from "@/lib/store";

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
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" aria-label="Loading" />
      </div>
    );
  }

  return <>{children}</>;
}
