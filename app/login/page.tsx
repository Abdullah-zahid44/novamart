"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Info } from "lucide-react";
import { login } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

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
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <div className="grid overflow-hidden rounded-[20px] border border-line bg-card lg:grid-cols-2">
        {/* Forest panel */}
        <div className="relative flex flex-col justify-between bg-forest p-8 sm:p-12">
          <p className="font-display text-2xl font-semibold text-paper">
            NovaMart<span className="text-accent">●</span>
          </p>
          <blockquote className="mt-10">
            <p className="font-display text-3xl font-medium italic leading-snug text-paper sm:text-4xl">
              “Good goods, fairly priced. That&apos;s the whole pitch.”
            </p>
            <footer className="mt-4 text-sm text-paper/70">
              — The NovaMart way of doing business
            </footer>
          </blockquote>
          <p className="mt-10 text-sm leading-relaxed text-paper/60">
            Sign in for faster checkout, live order tracking, and a wishlist that actually
            remembers what you saved.
          </p>
        </div>

        {/* Form card */}
        <div className="p-8 sm:p-12">
          <h1 className="font-display text-3xl font-semibold text-ink">Welcome back</h1>
          <p className="mt-2 text-sm text-muted">
            Sign in to pick up right where you left off.
          </p>

          <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
            {errors.form && (
              <div
                role="alert"
                className="rounded-xl border border-[#E26D5A]/30 bg-[#E26D5A]/10 px-4 py-3 text-sm text-[#A33B2A]"
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
              <p className="mt-1.5 text-right text-xs text-muted">
                Forgot your password? Contact us and we&apos;ll help you reset it.
              </p>
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            New to NovaMart?{" "}
            <Link href="/signup" className="font-semibold text-accent hover:text-accent-deep hover:underline">
              Create an account
            </Link>
          </p>

          <div className="mt-8 rounded-[14px] border border-line bg-sand p-4">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <div className="text-sm">
                <p className="font-semibold text-ink">Demo credentials</p>
                <dl className="mt-2 space-y-1.5 text-muted">
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="font-medium text-ink">Customer:</dt>
                    <dd className="font-mono text-xs sm:text-sm">demo@novamart.com</dd>
                    <dd className="font-mono text-xs text-accent-deep sm:text-sm">/ demo123</dd>
                  </div>
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="font-medium text-ink">Admin:</dt>
                    <dd className="font-mono text-xs sm:text-sm">admin@novamart.com</dd>
                    <dd className="font-mono text-xs text-accent-deep sm:text-sm">/ admin123</dd>
                  </div>
                </dl>
                <p className="mt-2 text-xs text-muted">
                  This demo storefront runs entirely in your browser — nothing leaves your device.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
