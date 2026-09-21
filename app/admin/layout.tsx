import type { ReactNode } from "react";
import { grotesk } from "@/components/admin/fonts";
import AdminShell from "@/components/admin/AdminShell";

export const metadata = {
  title: "Mission control — NovaMart Admin",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${grotesk.className} min-h-screen bg-[#14110D] text-[#F2EBDD] antialiased`}
    >
      <AdminShell>{children}</AdminShell>
    </div>
  );
}
