"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { KeyRound, ArrowRight, Copy, Check } from "lucide-react";
import { Logo } from "@/components/ui";

export default function ForgotPage() {
  const [question, setQuestion] = useState("Loading…");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/admin/forgot")
      .then((r) => r.json())
      .then((d) => setQuestion(d.recoveryQuestion || "What is your recovery keyword?"))
      .catch(() => setQuestion("What is your recovery keyword?"));
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not verify your answer");
        setLoading(false);
        return;
      }
      setToken(data.token);
    } catch {
      setError("Network error — please try again");
    }
    setLoading(false);
  }

  const input =
    "h-[3.25rem] w-full border border-rule-strong bg-paper px-4 text-[0.9375rem] text-ink placeholder:text-muted/70 focus:border-brand focus:outline-none";

  return (
    <div className="grid min-h-[80vh] place-items-center px-5 py-16">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2.5">
          <Logo className="h-11 w-auto" />
        </div>

        <div className="mt-8 border border-rule bg-card p-6 md:p-8">
          <span className="label inline-flex items-center gap-2">
            <KeyRound className="h-3.5 w-3.5 text-brand" /> Password recovery
          </span>
          <h1 className="mt-3 text-[clamp(1.6rem,5vw,2.2rem)] leading-tight text-ink">
            Reset your password
          </h1>

          {!token ? (
            <>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">
                Answer your recovery question to generate a one-time reset token.
              </p>
              <form onSubmit={submit} className="mt-7 space-y-4">
                <label className="block">
                  <span className="label">Recovery question</span>
                  <p className="mt-2 border border-rule bg-paper px-4 py-3 text-[0.9375rem] text-ink">
                    {question}
                  </p>
                </label>
                <label className="block">
                  <span className="label">Your answer</span>
                  <input
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your recovery answer"
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
                  {loading ? "Checking…" : "Generate reset token"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
              <p className="mt-4 text-[0.75rem] leading-relaxed text-muted">
                No email service is configured, so the token is shown to you directly on the next
                step. It expires in 30 minutes.
              </p>
            </>
          ) : (
            <>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">
                Verified. Copy this one-time token and continue to set a new password.
              </p>
              <div className="mt-6 flex items-center gap-2 border border-brand bg-tint px-4 py-3">
                <code className="flex-1 break-all text-[0.8125rem] text-brand-dark">{token}</code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(token);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  className="grid h-9 w-9 shrink-0 place-items-center bg-brand text-paper"
                  aria-label="Copy token"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <Link
                href={`/admin/reset?token=${encodeURIComponent(token)}`}
                className="mt-6 inline-flex min-h-[3.25rem] w-full items-center justify-center gap-2 bg-brand px-6 text-[0.9375rem] font-semibold text-paper transition-colors hover:bg-brand-dark"
              >
                Continue to reset <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          )}

          <div className="mt-5 border-t border-rule pt-4 text-[0.8125rem]">
            <Link href="/admin/login" className="text-muted hover:text-ink">
              ← Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
