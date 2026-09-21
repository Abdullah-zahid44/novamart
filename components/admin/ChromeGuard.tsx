"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

interface ChromeGuardProps {
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}

/**
 * Hides the storefront header/footer inside /admin so the dark
 * mission-control shell owns the full viewport.
 */
export default function ChromeGuard({ header, footer, children }: ChromeGuardProps) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") ?? false;

  return (
    <>
      {!isAdmin && header}
      <main id="main-content" tabIndex={-1} className={isAdmin ? undefined : "min-h-[60vh]"}>{children}</main>
      {!isAdmin && footer}
    </>
  );
}
