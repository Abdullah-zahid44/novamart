"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signup } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

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
    <div className="mx-auto w-full max-w-md px-4 py-12 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Create your account</h1>
        <p className="mt-2 text-sm text-gray-600">
          Join NovaMart for faster checkout, order tracking and a personal wishlist.
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

          <p className="text-xs leading-relaxed text-gray-500">
            By creating an account you agree to NovaMart&apos;s Terms of Service and Privacy Policy.
            This is a demo storefront — your account lives only in this browser.
          </p>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
