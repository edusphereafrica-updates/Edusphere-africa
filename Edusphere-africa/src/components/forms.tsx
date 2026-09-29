"use client";

import { useState, type FormEvent } from "react";
import { Check, Send } from "lucide-react";
import { SITE } from "@/lib/site";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setState("loading");
    setError("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await res.json().catch(() => ({}));
      if (res.ok) {
        setState("done");
      } else {
        setError(typeof result.error === "string" ? result.error : "Could not subscribe. Please try again later.");
        setState("error");
      }
    } catch {
      setError("Could not connect. Please try again later.");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="flex min-h-[3.75rem] items-center gap-3 border border-brand bg-tint px-5 py-4 text-[0.9375rem] font-semibold text-brand-dark">
        <Check className="h-5 w-5" strokeWidth={2.6} /> You&apos;re on the list — first digest lands Monday.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        aria-label="Email address"
        className="h-[3.75rem] min-w-0 flex-1 border border-rule-strong bg-paper px-4 text-[0.9375rem] text-ink placeholder:text-muted/70 focus:border-brand focus:outline-none"
      />
      <button
        type="submit"
        disabled={state === "loading"}
        className="inline-flex h-[3.75rem] items-center justify-center gap-2 bg-brand px-7 text-[0.9375rem] font-semibold text-paper transition-colors hover:bg-brand-dark disabled:opacity-70"
      >
        {state === "loading" ? "Subscribing…" : "Subscribe"}
        <Send className="h-4 w-4" />
      </button>
      {state === "error" && (
        <p role="alert" className="text-[0.8125rem] leading-relaxed text-accent sm:basis-full">
          {error}{" "}
          <a
            href={SITE.whatsappChannel}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline underline-offset-2"
          >
            Follow our WhatsApp channel
          </a>
          .
        </p>
      )}
    </form>
  );
}

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", type: "General enquiry", message: "" });
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setState("loading");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await res.json().catch(() => ({}));
      if (res.ok) {
        setState("done");
      } else {
        setError(typeof result.error === "string" ? result.error : "Could not send. Please try again later.");
        setState("error");
      }
    } catch {
      setError("Could not connect. Please email us instead.");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="border border-brand bg-tint p-6">
        <p className="flex items-center gap-2.5 text-[1rem] font-semibold text-brand-dark">
          <Check className="h-5 w-5" strokeWidth={2.6} /> Message received
        </p>
        <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">
          Thanks, {form.name.split(" ")[0] || "there"}. Our editorial team replies within two working
          days.
        </p>
      </div>
    );
  }

  const input =
    "h-[3.25rem] w-full border border-rule-strong bg-paper px-4 text-[0.9375rem] text-ink placeholder:text-muted/70 focus:border-brand focus:outline-none";

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <label className="block">
        <span className="label">Full name</span>
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className={`${input} mt-2`}
          placeholder="Ada Okonkwo"
        />
      </label>
      <label className="block">
        <span className="label">Email</span>
        <input
          required
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className={`${input} mt-2`}
          placeholder="you@example.com"
        />
      </label>
      <label className="block sm:col-span-2">
        <span className="label">What is this about?</span>
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className={`${input} mt-2 appearance-none`}
        >
          <option>General enquiry</option>
          <option>Submit an Opportunity</option>
          <option>Advertise with us</option>
          <option>Partnership</option>
          <option>Report a correction</option>
        </select>
      </label>
      <label className="block sm:col-span-2">
        <span className="label">Message</span>
        <textarea
          required
          rows={6}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="mt-2 w-full resize-y border border-rule-strong bg-paper p-4 text-[0.9375rem] leading-relaxed text-ink placeholder:text-muted/70 focus:border-brand focus:outline-none"
          placeholder="Tell us about the opportunity, scholarship or correction…"
        />
      </label>
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={state === "loading"}
          className="inline-flex min-h-[3.5rem] w-full items-center justify-center gap-2 bg-brand px-8 text-[0.9375rem] font-semibold text-paper transition-colors hover:bg-brand-dark disabled:opacity-70 sm:w-auto"
        >
          {state === "loading" ? "Sending…" : "Send message"}
          <Send className="h-4 w-4" />
        </button>
        {state === "error" && (
          <p role="alert" className="mt-3 text-[0.8125rem] leading-relaxed text-accent">
            {error}{" "}
            <a href={SITE.emailUrl} className="font-semibold underline underline-offset-2">
              Email {SITE.email}
            </a>
            .
          </p>
        )}
      </div>
    </form>
  );
}
