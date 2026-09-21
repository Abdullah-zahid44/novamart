"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Info } from "lucide-react";
import { login } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

type Errors = { email?: string; password?: string; form?: string };

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  function validate(): Errors {
    const e: Errors = {};
    if (!email.trim()) {
      e.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      e.email = "That doesn't look like a valid email address.";
    }
    if (!password) {
      e.password = "Please enter your password.";
    }
    return e;
  }

  function handleSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setLoading(true);
    const res = login(email.trim(), password);
    setLoading(false);

    if (!res.ok) {
      setErrors({
        form: res.error ?? "We couldn't sign you in. Please check your details and try again.",
      });
      return;
    }
    router.push("/account");
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Welcome back</h1>
        <p className="mt-2 text-sm text-gray-600">
          Sign in to track your orders, manage your wishlist and check out faster.
        </p>
      </div>

      <Card className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {errors.form && (
            <div
              role="alert"
              className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            >
              {errors.form}
            </div>
          )}

          <Input
            id="email"
            name="email"
            type="email"
            label="Email address"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            error={errors.email}
          />

          <div>
            <Input
              id="password"
              name="password"
              type="password"
              label="Password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              error={errors.password}
            />
            <div className="mt-1 text-right">
              <span className="text-xs text-gray-500">
                Forgot your password? Contact us and we&apos;ll help you reset it.
              </span>
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          New to NovaMart?{" "}
          <Link href="/signup" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Create an account
          </Link>
        </p>
      </Card>

      <div className="mt-6 rounded-xl border border-indigo-200 bg-indigo-50 p-4">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />
          <div className="text-sm">
            <p className="font-semibold text-indigo-900">Demo credentials</p>
            <dl className="mt-2 space-y-1.5 text-indigo-800">
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-medium">Customer:</dt>
                <dd className="font-mono text-xs sm:text-sm">demo@novamart.com</dd>
                <dd className="font-mono text-xs text-indigo-600 sm:text-sm">/ demo123</dd>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-medium">Admin:</dt>
                <dd className="font-mono text-xs sm:text-sm">admin@novamart.com</dd>
                <dd className="font-mono text-xs text-indigo-600 sm:text-sm">/ admin123</dd>
              </div>
            </dl>
            <p className="mt-2 text-xs text-indigo-700">
              This demo storefront runs entirely in your browser — nothing leaves your device.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
