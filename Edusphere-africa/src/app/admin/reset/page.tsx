"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { KeyRound, Check } from "lucide-react";
import { Logo } from "@/components/ui";

function ResetInner() {
  const router = useRouter();
  const params = useSearchParams();

  const [token, setToken] = useState(params.get("token") || "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("The two passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not reset password");
        setLoading(false);
        return;
      }
      setDone(true);
      setTimeout(() => router.replace("/admin/login"), 1800);
    } catch {
      setError("Network error — please try again");
      setLoading(false);
    }
  }

  const input =
    "h-[3.25rem] w-full border border-rule-strong bg-paper px-4 text-[0.9375rem] text-ink placeholder:text-muted/70 focus:border-brand focus:outline-none";

  return (
    <div className="w-full max-w-md">
      <div className="flex items-center gap-2.5">
        <Logo className="h-11 w-auto" />
      </div>

      <div className="mt-8 border border-rule bg-card p-6 md:p-8">
        <span className="label inline-flex items-center gap-2">
          <KeyRound className="h-3.5 w-3.5 text-brand" /> Set a new password
        </span>

        {done ? (
          <div className="mt-5 border border-brand bg-tint p-5">
            <p className="flex items-center gap-2.5 text-[1rem] font-semibold text-brand-dark">
              <Check className="h-5 w-5" strokeWidth={2.6} /> Password updated
            </p>
            <p className="mt-2 text-[0.9375rem] text-muted">Redirecting you to sign in…</p>
          </div>
        ) : (
          <>
            <h1 className="mt-3 text-[clamp(1.6rem,5vw,2.2rem)] leading-tight text-ink">
              Choose a new password
            </h1>
            <form onSubmit={submit} className="mt-7 space-y-4">
              <label className="block">
                <span className="label">Reset token</span>
                <input
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste your one-time token"
                  className={`${input} mt-2`}
                />
              </label>
              <label className="block">
                <span className="label">New password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  className={`${input} mt-2`}
                />
              </label>
              <label className="block">
                <span className="label">Confirm new password</span>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  className={`${input} mt-2`}
                />
              </label>

              {error && (
                <p className="border-l-2 border-accent bg-accent/5 px-4 py-2.5 text-[0.8125rem] text-accent">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex min-h-[3.25rem] w-full items-center justify-center gap-2 bg-brand px-6 text-[0.9375rem] font-semibold text-paper transition-colors hover:bg-brand-dark disabled:opacity-70"
              >
                {loading ? "Updating…" : "Update password"}
              </button>
            </form>
          </>
        )}

        <div className="mt-5 border-t border-rule pt-4 text-[0.8125rem]">
          <Link href="/admin/login" className="text-muted hover:text-ink">
            ← Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPage() {
  return (
    <div className="grid min-h-[80vh] place-items-center px-5 py-16">
      <Suspense fallback={<div className="text-muted">Loading…</div>}>
        <ResetInner />
      </Suspense>
    </div>
  );
}
