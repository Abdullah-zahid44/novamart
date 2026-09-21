"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Lock } from "lucide-react";
import { login, logout } from "@/lib/store";
import { fraunces, grotesk } from "@/components/admin/fonts";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Email and password — both, please.");
      return;
    }

    const result = login(email.trim(), password);
    if (!result.ok) {
      setError(result.error ?? "Sign in failed. Check the credentials and try again.");
      return;
    }

    if (result.user?.role !== "admin") {
      logout();
      setError("That account isn't an administrator. This door is staff-only.");
      return;
    }

    router.replace("/admin");
  };

  return (
    <div
      className={`${grotesk.className} flex min-h-screen items-center justify-center bg-[#14110D] px-4 py-10`}
    >
      <div className="w-full max-w-sm">
        <div className="rounded-[14px] border border-[#2E2820] bg-[#1E1A14] p-8">
          <div className="mb-6 text-center">
            <p className={`${fraunces.className} text-3xl font-bold text-[#F2EBDD]`}>
              NovaMart<span className="ml-1 inline-block h-2 w-2 rounded-full bg-[#E4572E]" />
            </p>
            <h1 className={`${fraunces.className} mt-4 text-2xl font-semibold text-[#F2EBDD]`}>
              Mission control.
            </h1>
            <p className="mt-1.5 text-sm text-[#A39A89]">Sign in to run the store.</p>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-[#E26D5A]/40 bg-[#E26D5A]/10 px-3 py-2.5 text-sm text-[#E26D5A]">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-[#F2EBDD]"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@novamart.com"
                className="w-full rounded-lg border border-[#2E2820] bg-[#14110D] px-3 py-2.5 text-sm text-[#F2EBDD] placeholder-[#A39A89]/60 outline-none transition-colors focus:border-[#E4572E]"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-[#F2EBDD]"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-[#2E2820] bg-[#14110D] px-3 py-2.5 text-sm text-[#F2EBDD] placeholder-[#A39A89]/60 outline-none transition-colors focus:border-[#E4572E]"
              />
            </div>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#E4572E] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#C74A26] active:scale-[0.98]"
            >
              <Lock className="h-4 w-4" />
              Sign in
            </button>
          </form>

          <div className="mt-6 rounded-lg border border-[#2E2820] bg-[#14110D] px-4 py-3 text-xs text-[#A39A89]">
            <p className="font-semibold text-[#F2EBDD]">Demo credentials</p>
            <p className="mt-1.5">
              Email: <code className="font-mono text-[#E0A458]">admin@novamart.com</code>
              <br />
              Password: <code className="font-mono text-[#E0A458]">admin123</code>
            </p>
          </div>

          <p className="mt-6 text-center text-sm">
            <Link href="/" className="text-[#E4572E] hover:underline">
              ← Back to the store
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
