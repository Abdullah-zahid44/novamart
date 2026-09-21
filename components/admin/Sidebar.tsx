"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Ticket,
  Star,
  Settings,
  Store,
  LogOut,
  X,
} from "lucide-react";
import { logout } from "@/lib/store";
import { fraunces } from "./fonts";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex-1 space-y-1 px-4" aria-label="Admin">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-[#2E2820] text-[#F2EBDD]"
                : "text-[#A39A89] hover:bg-[#26211A] hover:text-[#F2EBDD]"
            }`}
          >
            {active && (
              <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-[#E4572E]" />
            )}
            <Icon className={`h-5 w-5 shrink-0 ${active ? "text-[#E4572E]" : ""}`} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();
  const handleSignOut = () => {
    logout();
    onNavigate?.();
    router.replace("/admin/login");
  };
  return (
    <div className="space-y-1 border-t border-[#2E2820] px-4 py-4">
      <Link
        href="/"
        onClick={onNavigate}
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[#A39A89] transition-colors hover:bg-[#26211A] hover:text-[#F2EBDD]"
      >
        <Store className="h-5 w-5 shrink-0" />
        View store
      </Link>
      <button
        type="button"
        onClick={handleSignOut}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[#A39A89] transition-colors hover:bg-[#26211A] hover:text-[#E26D5A]"
      >
        <LogOut className="h-5 w-5 shrink-0" />
        Sign out
      </button>
    </div>
  );
}

function Brand({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link href="/admin" onClick={onNavigate} className="flex items-center gap-2.5 px-6 py-6">
      <span className={`${fraunces.className} text-[1.65rem] font-bold leading-none text-[#F2EBDD]`}>
        NovaMart<span className="ml-1 inline-block h-2 w-2 rounded-full bg-[#E4572E]" />
      </span>
    </Link>
  );
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-[#2E2820] bg-[#1E1A14] lg:flex">
        <Brand />
        <NavLinks />
        <SidebarFooter />
      </aside>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <div
          className={`absolute inset-0 bg-black/60 transition-opacity duration-200 ${
            open ? "opacity-100" : "opacity-0"
          }`}
          onClick={onClose}
        />
        <aside
          className={`absolute inset-y-0 left-0 flex w-72 flex-col bg-[#1E1A14] shadow-2xl transition-transform duration-200 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between">
            <Brand onNavigate={onClose} />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close navigation"
              className="mr-4 rounded-lg p-2 text-[#A39A89] hover:bg-[#2E2820] hover:text-[#F2EBDD]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <NavLinks onNavigate={onClose} />
          <SidebarFooter onNavigate={onClose} />
        </aside>
      </div>
    </>
  );
}
