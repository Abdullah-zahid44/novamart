"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Lock } from "lucide-react";
import { login, logout } from "@/lib/store";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    const result = login(email.trim(), password);
    if (!result.ok) {
      setError(result.error ?? "Sign in failed. Please try again.");
      return;
    }

    if (result.user?.role !== "admin") {
      logout();
      setError("This is not an admin account. Please use an administrator login.");
      return;
    }

    router.replace("/admin");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-xl font-bold text-white">
              N
            </span>
            <h1 className="mt-4 text-xl font-bold text-gray-900">NovaMart Admin</h1>
            <p className="mt-1 text-sm text-gray-500">Sign in to the admin console</p>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@novamart.com"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <Lock className="h-4 w-4" />
              Sign in
            </button>
          </form>

          <div className="mt-6 rounded-lg bg-indigo-50 px-4 py-3 text-xs text-indigo-800">
            <p className="font-semibold">Demo credentials</p>
            <p className="mt-1">
              Email: <code className="font-mono">admin@novamart.com</code>
              <br />
              Password: <code className="font-mono">admin123</code>
            </p>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            <Link href="/" className="text-indigo-600 hover:underline">
              ← Back to store
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
