"use client";

import Link from "next/link";
import { useState } from "react";
import { LogOut, LoaderCircle } from "lucide-react";
import { Logo } from "@/components/ui";

/**
 * The session token lives in the URL path, so signing out is a revoke + go.
 */
export function AdminBar({ username, token }: { username: string; token: string }) {
  const [loading, setLoading] = useState(false);

  async function logout() {
    if (loading) return;
    setLoading(true);
    try {
      await fetch(`/api/admin/t/${encodeURIComponent(token)}/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
        credentials: "include",
      });
    } catch {
      /* even offline, leave the desk */
    } finally {
      window.location.replace("/admin/login?state=signedout");
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-paper/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[80rem] items-center justify-between gap-4 px-5 md:px-8">
        <Link href={`/admin/t/${encodeURIComponent(token)}`} className="flex items-center gap-2" aria-label="Admin home">
          <Logo className="h-9 w-auto" />
          <span className="label !text-[0.6rem] hidden border-l border-rule pl-2 sm:inline">
            Admin desk
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <a
            href={`/admin/t/${encodeURIComponent(token)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden h-10 items-center px-3 text-[0.8125rem] font-medium text-muted transition-colors hover:text-ink sm:inline-flex"
          >
            New tab ↗
          </a>
          <span className="hidden items-center gap-2 border border-rule px-3 py-2 text-[0.75rem] text-muted md:inline-flex">
            <span className="h-2 w-2 rounded-full bg-brand" />
            {username}
          </span>
          <button
            type="button"
            onClick={logout}
            disabled={loading}
            className="inline-flex min-h-11 items-center gap-2 border border-rule-strong px-4 text-[0.8125rem] font-semibold text-ink transition-colors hover:border-accent hover:text-accent disabled:opacity-60"
          >
            {loading ? (
              <LoaderCircle className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
            ) : (
              <LogOut className="h-4 w-4" aria-hidden="true" />
            )}
            {loading ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </div>
    </header>
  );
}
