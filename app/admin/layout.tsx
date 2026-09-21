"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import AdminGate from "@/components/admin/AdminGate";
import Sidebar from "@/components/admin/Sidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <AdminGate>
      <div className="flex min-h-screen flex-col bg-gray-50 lg:flex-row">
        <Sidebar />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </AdminGate>
  );
}
