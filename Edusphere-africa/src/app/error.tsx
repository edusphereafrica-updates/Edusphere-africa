"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Logo } from "@/components/ui";

/** Branded safety net for unexpected production render errors. */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Edusphere Africa page error", error.digest ?? error.name);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[68vh] max-w-2xl flex-col justify-center px-5 py-16 md:px-8">
      <Logo className="h-14 w-auto self-start" />
      <p className="label mt-10">Page temporarily unavailable</p>
      <h1 className="mt-4 text-[clamp(2rem,6vw,3.25rem)] leading-tight text-ink">
        Let&apos;s get you back on track.
      </h1>
      <p className="mt-4 max-w-lg text-[0.975rem] leading-relaxed text-muted">
        This page could not finish loading. You can retry or browse opportunities while we restore it.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-[3.25rem] items-center bg-brand px-7 text-[0.9375rem] font-semibold text-paper transition-colors hover:bg-brand-dark"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex min-h-[3.25rem] items-center border border-rule-strong bg-card px-7 text-[0.9375rem] font-semibold text-ink transition-colors hover:border-ink"
        >
          Go to homepage
        </Link>
      </div>
    </div>
  );
}
