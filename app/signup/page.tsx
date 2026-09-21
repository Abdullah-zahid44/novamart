"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signup } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type Errors = {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
  form?: string;
};

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  function validate(): Errors {
    const e: Errors = {};
    if (name.trim().length < 2) {
      e.name = "Please enter your full name.";
    }
    if (!email.trim()) {
      e.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      e.email = "That doesn't look like a valid email address.";
    }
    if (password.length < 8) {
      e.password = "Password must be at least 8 characters.";
    }
    if (confirm !== password) {
      e.confirm = "Passwords don't match.";
    }
    return e;
  }

  function handleSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setLoading(true);
    const res = signup(name.trim(), email.trim(), password);
    setLoading(false);

    if (!res.ok) {
      setErrors({
        form:
          res.error ??
          "We couldn't create your account. Please try again.",
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
              “One account. Faster checkout, honest tracking, zero spam.”
            </p>
            <footer className="mt-4 text-sm text-paper/70">
              — What you actually get
            </footer>
          </blockquote>
          <p className="mt-10 text-sm leading-relaxed text-paper/60">
            Join NovaMart for one-click reorders, a wishlist that remembers, and order updates
            that don&apos;t require a support ticket.
          </p>
        </div>

        {/* Form card */}
        <div className="p-8 sm:p-12">
          <h1 className="font-display text-3xl font-semibold text-ink">Join NovaMart</h1>
          <p className="mt-2 text-sm text-muted">
            Takes about thirty seconds. We&apos;ll keep it painless.
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
              id="name"
              name="name"
              type="text"
              label="Full name"
              placeholder="Alex Morgan"
              autoComplete="name"
              value={name}
              onChange={(ev) => setName(ev.target.value)}
              error={errors.name}
            />

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

            <Input
              id="password"
              name="password"
              type="password"
              label="Password"
              placeholder="At least 8 characters"
              autoComplete="new-password"
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              error={errors.password}
            />

            <Input
              id="confirm"
              name="confirm"
              type="password"
              label="Confirm password"
              placeholder="Repeat your password"
              autoComplete="new-password"
              value={confirm}
              onChange={(ev) => setConfirm(ev.target.value)}
              error={errors.confirm}
            />

            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
              {loading ? "Creating account…" : "Create account"}
            </Button>

            <p className="text-xs leading-relaxed text-muted">
              By creating an account you agree to NovaMart&apos;s Terms of Service and Privacy
              Policy. This is a demo storefront — your account lives only in this browser.
            </p>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-accent hover:text-accent-deep hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
