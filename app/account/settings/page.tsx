"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { currentUser, updateUser } from "@/lib/store";
import type { User } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

type ProfileErrors = { name?: string; form?: string };
type PasswordErrors = { current?: string; next?: string; confirm?: string; form?: string };

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);

  const [name, setName] = useState("");
  const [profileErrors, setProfileErrors] = useState<ProfileErrors>({});
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  const [currentPw, setCurrentPw] = useState("");
  const [nextPw, setNextPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwErrors, setPwErrors] = useState<PasswordErrors>({});
  const [pwSaved, setPwSaved] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    const u = currentUser();
    if (!u) return;
    setUser(u);
    setName(u.name);
  }, []);

  if (!user) return null;

  function handleProfileSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const u = user;
    if (!u) return;
    setProfileSaved(false);
    const e: ProfileErrors = {};
    if (name.trim().length < 2) e.name = "Please enter your full name.";
    setProfileErrors(e);
    if (Object.keys(e).length > 0) return;

    setProfileLoading(true);
    try {
      updateUser(u.id, { name: name.trim() });
      setUser({ ...u, name: name.trim() });
      setProfileSaved(true);
    } catch {
      setProfileErrors({ form: "We couldn't save your changes. Please try again." });
    }
    setProfileLoading(false);
  }

  function handlePasswordSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const u = user;
    if (!u) return;
    setPwSaved(false);
    const e: PasswordErrors = {};
    const fresh = currentUser();

    if (!currentPw) {
      e.current = "Enter your current password.";
    } else if (fresh && currentPw !== fresh.password) {
      e.current = "Your current password doesn't match.";
    }
    if (nextPw.length < 8) {
      e.next = "New password must be at least 8 characters.";
    } else if (nextPw === currentPw) {
      e.next = "New password must be different from the current one.";
    }
    if (confirmPw !== nextPw) {
      e.confirm = "Passwords don't match.";
    }
    setPwErrors(e);
    if (Object.keys(e).length > 0) return;

    setPwLoading(true);
    try {
      updateUser(u.id, { password: nextPw });
      setUser({ ...u, password: nextPw });
      setCurrentPw("");
      setNextPw("");
      setConfirmPw("");
      setPwSaved(true);
    } catch {
      setPwErrors({ form: "We couldn't change your password. Please try again." });
    }
    setPwLoading(false);
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted">
          Keep your profile details and password up to date.
        </p>
      </div>

      {/* Profile */}
      <Card className="p-5 sm:p-6">
        <h2 className="font-display text-lg font-semibold text-ink">Profile</h2>
        <form onSubmit={handleProfileSubmit} noValidate className="mt-4 space-y-4">
          {profileErrors.form && (
            <div
              role="alert"
              className="rounded-xl border border-[#E26D5A]/30 bg-[#E26D5A]/10 px-4 py-3 text-sm text-[#A33B2A]"
            >
              {profileErrors.form}
            </div>
          )}
          {profileSaved && (
            <div className="flex items-center gap-2 rounded-xl border border-[#7FB069]/40 bg-[#7FB069]/15 px-4 py-3 text-sm text-[#2F5D34]">
              <CheckCircle2 className="h-4 w-4" /> Your name has been updated.
            </div>
          )}
          <Input
            id="name"
            label="Full name"
            autoComplete="name"
            value={name}
            onChange={(ev) => setName(ev.target.value)}
            error={profileErrors.name}
          />
          <div>
            <span className="mb-1 block text-sm font-medium text-ink/80">Email address</span>
            <p className="rounded-xl bg-sand px-4 py-2.5 text-sm text-muted">{user.email}</p>
            <p className="mt-1 text-xs text-muted">
              Email addresses can&apos;t be changed on a demo account.
            </p>
          </div>
          <Button type="submit" variant="primary" disabled={profileLoading}>
            {profileLoading ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </Card>

      {/* Password */}
      <Card className="mt-6 p-5 sm:p-6">
        <h2 className="font-display text-lg font-semibold text-ink">Change password</h2>
        <form onSubmit={handlePasswordSubmit} noValidate className="mt-4 space-y-4">
          {pwErrors.form && (
            <div
              role="alert"
              className="rounded-xl border border-[#E26D5A]/30 bg-[#E26D5A]/10 px-4 py-3 text-sm text-[#A33B2A]"
            >
              {pwErrors.form}
            </div>
          )}
          {pwSaved && (
            <div className="flex items-center gap-2 rounded-xl border border-[#7FB069]/40 bg-[#7FB069]/15 px-4 py-3 text-sm text-[#2F5D34]">
              <CheckCircle2 className="h-4 w-4" /> Your password has been changed.
            </div>
          )}
          <Input
            id="current-password"
            type="password"
            label="Current password"
            autoComplete="current-password"
            value={currentPw}
            onChange={(ev) => setCurrentPw(ev.target.value)}
            error={pwErrors.current}
          />
          <Input
            id="new-password"
            type="password"
            label="New password"
            placeholder="At least 8 characters"
            autoComplete="new-password"
            value={nextPw}
            onChange={(ev) => setNextPw(ev.target.value)}
            error={pwErrors.next}
          />
          <Input
            id="confirm-password"
            type="password"
            label="Confirm new password"
            autoComplete="new-password"
            value={confirmPw}
            onChange={(ev) => setConfirmPw(ev.target.value)}
            error={pwErrors.confirm}
          />
          <Button type="submit" variant="primary" disabled={pwLoading}>
            {pwLoading ? "Updating…" : "Update password"}
          </Button>
        </form>
      </Card>

      {/* Danger zone */}
      <Card className="mt-6 border-[#E26D5A]/40 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#E26D5A]" />
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">Danger zone</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Account deletion isn&apos;t available in this demo storefront — all NovaMart data
              lives only in your browser&apos;s local storage. To start over, clear this
              site&apos;s stored data from your browser settings, which removes your account,
              orders and wishlist in one step.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
