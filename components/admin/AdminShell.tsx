"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import AdminGate from "./AdminGate";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);

  // The login screen stands alone — no shell, no guard.
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <AdminGate>
      <div className="flex min-h-screen">
        <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar onMenu={() => setNavOpen(true)} />
          <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">{children}</main>
        </div>
      </div>
    </AdminGate>
  );
}
