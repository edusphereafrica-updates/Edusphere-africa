"use client";

import Link from "next/link";
import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { Lock, LogIn, ShieldCheck, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { Logo } from "@/components/ui";

function LoginInner() {
  const params = useSearchParams();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("Signing in…");

  useEffect(() => {
    if (params.get("state") === "expired") {
      setError("That session has expired or was signed out. Please sign in again.");
    } else if (params.get("state") === "database") {
      setError("Admin sign-in needs a hosted PostgreSQL connection. Add DATABASE_URL or POSTGRES_URL in your Vercel project settings and redeploy.");
    }
  }, [params]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setProgress("Signing in…");
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
        signal: AbortSignal.timeout(20000),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok || data?.ok !== true || typeof data.token !== "string") {
        setError(
          typeof data?.error === "string"
            ? data.error
            : `The login server returned an unexpected response (HTTP ${response.status}). Please reload and try again.`,
        );
        setLoading(false);
        return;
      }

      // The session travels in the URL path from here on, so nothing depends on
      // cookies, custom headers or browser storage surviving the redirect.
      setProgress("Opening admin desk…");
      window.location.replace(`/api/admin/enter?t=${encodeURIComponent(data.token)}`);
    } catch (cause) {
      const timedOut = cause instanceof Error && ["TimeoutError", "AbortError"].includes(cause.name);
      setError(
        timedOut
          ? "Sign-in took too long. Check your connection and try again."
          : "Unable to connect. Please check your internet connection and try again.",
      );
      // Always re-enable the form so a single failure never locks the user out.
      setLoading(false);
    }
  }

  const input =
    "h-[3.25rem] w-full border border-rule-strong bg-paper px-4 text-[0.9375rem] text-ink placeholder:text-muted/70 focus:border-brand focus:outline-none disabled:opacity-70";

  return (
    <div className="w-full max-w-md">
      <div className="flex items-center gap-2.5">
        <Logo className="h-11 w-auto" />
      </div>

      <div className="mt-8 border border-rule bg-card p-6 md:p-8">
        <span className="label inline-flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-brand" aria-hidden="true" /> Admin desk
        </span>
        <h1 className="mt-3 text-[clamp(1.6rem,5vw,2.2rem)] leading-tight text-ink">Sign in</h1>
        <p id="admin-login-help" className="mt-2 text-[0.9375rem] leading-relaxed text-muted">
          Use your administrator username and password to manage subscribers and publish
          opportunities.
        </p>

        <form onSubmit={submit} aria-busy={loading} className="mt-7 space-y-4">
          <div>
            <label htmlFor="admin-username" className="label">
              Username
            </label>
            <input
              id="admin-username"
              name="username"
              required
              maxLength={64}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              disabled={loading}
              className={`${input} mt-2`}
            />
          </div>
          <div>
            <label htmlFor="admin-password" className="label">
              Password
            </label>
            <div className="relative mt-2">
              <Lock
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                aria-hidden="true"
              />
              <input
                id="admin-password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                maxLength={1024}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyUp={(e) => setCapsLock(e.getModifierState("CapsLock"))}
                onKeyDown={(e) => setCapsLock(e.getModifierState("CapsLock"))}
                onBlur={() => setCapsLock(false)}
                autoComplete="current-password"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                disabled={loading}
                placeholder="Enter your password"
                aria-describedby={error ? "admin-login-error" : "admin-login-help"}
                className={`${input} !pl-11 !pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute right-1 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center text-muted transition-colors hover:text-brand"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {capsLock && (
              <p className="mt-2 text-[0.8125rem] text-accent" role="status">
                Caps Lock is on.
              </p>
            )}
          </div>

          {error && (
            <div
              id="admin-login-error"
              role="alert"
              className="border-l-2 border-accent bg-accent/5 px-4 py-3 text-[0.8125rem] leading-relaxed text-accent"
            >
              {error}
              <span className="mt-2 block text-[0.75rem] leading-relaxed text-accent/80">
                If this keeps happening, hard-refresh the page (Ctrl/Cmd + Shift + R) so you are
                running the current build, then sign in again.
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex min-h-[3.25rem] w-full items-center justify-center gap-2 bg-brand px-6 text-[0.9375rem] font-semibold text-paper transition-colors hover:bg-brand-dark disabled:opacity-70"
          >
            {loading ? progress : "Sign in"}
            {loading ? (
              <LoaderCircle
                className="h-4 w-4 animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
            ) : (
              <LogIn className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </form>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-rule pt-4 text-[0.8125rem]">
          <Link
            href="/admin/forgot"
            className="inline-flex min-h-11 items-center font-medium text-brand hover:underline"
          >
            Forgot password?
          </Link>
          <Link href="/" className="inline-flex min-h-11 items-center text-muted hover:text-ink">
            ← Back to site
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="grid min-h-[85vh] place-items-center px-5 py-10 sm:py-16">
      <Suspense fallback={<div className="text-muted" role="status">Loading sign-in…</div>}>
        <LoginInner />
      </Suspense>
    </div>
  );
}
