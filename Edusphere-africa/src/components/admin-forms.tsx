"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Check, PlusCircle, Save, X, KeyRound, ExternalLink, ImagePlus } from "lucide-react";

const input =
  "h-[3.25rem] w-full border border-rule-strong bg-paper px-4 text-[0.9375rem] text-ink placeholder:text-muted/70 focus:border-brand focus:outline-none";
const area =
  "w-full resize-y border border-rule-strong bg-paper p-4 text-[0.9375rem] leading-relaxed text-ink placeholder:text-muted/70 focus:border-brand focus:outline-none";

const OPP_TYPES = ["Fellowship", "Grant", "Competition", "Training", "Conference", "Exchange"];
const STUDY_LEVELS = ["Undergraduate", "Postgraduate", "PhD", "Postdoctoral", "Any level"];
const FUNDING_TYPES = ["Fully funded", "Partial funding", "Tuition waiver", "Stipend only"];
const CATEGORIES = ["Admissions", "Examinations", "Fees & Payment", "Academic Calendar", "Registration", "General"];

// Source photo ceiling before it's read into the form. Encoded as base64 this
// grows by about a third, which is still comfortably inside the request-body
// limit alongside the rest of the form fields.
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

/**
 * Reusable "official image" field: an upload button with a live preview, a
 * fallback manual URL/path entry, and a credit line. Shared by every
 * publish/edit form so each content type gets identical image handling.
 */
function ImageUploadField({
  image,
  onImageChange,
  imageCredit,
  onImageCreditChange,
}: {
  image: string;
  onImageChange: (value: string) => void;
  imageCredit: string;
  onImageCreditChange: (value: string) => void;
}) {
  const [error, setError] = useState("");

  function onFile(file: File | null) {
    setError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("That image is too large — please use one under 3MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onImageChange(String(reader.result));
    reader.onerror = () => setError("Could not read that image — please try another file.");
    reader.readAsDataURL(file);
  }

  return (
    <>
      <div className="block md:col-span-2">
        <span className="label">Official image</span>
        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="h-28 w-full shrink-0 overflow-hidden border border-rule-strong bg-tint sm:w-40">
            {image ? (
              // Preview only — this is never a remote/user-controlled URL rendered
              // as trusted HTML, just an <img> src (data URI, path, or https link).
              <img src={image} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center px-2 text-center text-[0.6875rem] text-muted">
                No image yet
              </div>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <label className="inline-flex h-11 cursor-pointer items-center gap-2 border border-rule-strong bg-paper px-4 text-[0.8125rem] font-semibold text-ink transition-colors hover:border-brand">
              <ImagePlus className="h-4 w-4" />
              {image ? "Replace image" : "Upload official image"}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onFile(e.target.files?.[0] ?? null)}
                className="sr-only"
              />
            </label>
            <p className="text-[0.75rem] leading-relaxed text-muted">
              The official photo or logo, shown on the page and its card. JPG or PNG, under 3MB.
            </p>
            {error && <p className="text-[0.75rem] text-accent">{error}</p>}
            <details className="text-[0.8125rem]">
              <summary className="cursor-pointer select-none text-brand hover:underline">
                …or use an image path/URL instead
              </summary>
              <input
                value={image.startsWith("data:") ? "" : image}
                onChange={(e) => onImageChange(e.target.value)}
                className={`${input} mt-2`}
                placeholder="/images/… or https://… (leave blank for default art)"
              />
            </details>
          </div>
        </div>
      </div>
      <label className="block md:col-span-2">
        <span className="label">Image credit (optional)</span>
        <input
          value={imageCredit}
          onChange={(e) => onImageCreditChange(e.target.value)}
          className={`${input} mt-2`}
          placeholder="Defaults to “Official provider artwork · via Edusphere Africa”"
        />
      </label>
    </>
  );
}

export type EditableOpportunity = {
  id: number;
  slug: string;
  title: string;
  organization: string;
  oppType: string;
  region: string;
  summary: string;
  deadline: string;
  applyUrl: string;
  sourceName: string;
  sourceUrl: string;
  image: string;
  imageCredit: string;
  eligibility: string[];
  benefits: string[];
  process: string[];
};

type FormState = {
  title: string;
  organization: string;
  oppType: string;
  region: string;
  summary: string;
  deadline: string;
  applyUrl: string;
  sourceName: string;
  sourceUrl: string;
  image: string;
  imageCredit: string;
  eligibility: string;
  benefits: string;
  process: string;
};

function emptyForm(): FormState {
  return {
    title: "",
    organization: "",
    oppType: "Fellowship",
    region: "",
    summary: "",
    deadline: "",
    applyUrl: "",
    sourceName: "",
    sourceUrl: "",
    image: "",
    imageCredit: "",
    eligibility: "",
    benefits: "",
    process: "",
  };
}

function formFromOpportunity(o: EditableOpportunity): FormState {
  return {
    title: o.title,
    organization: o.organization,
    oppType: o.oppType,
    region: o.region,
    summary: o.summary,
    deadline: o.deadline,
    applyUrl: o.applyUrl,
    sourceName: o.sourceName,
    sourceUrl: o.sourceUrl,
    image: o.image,
    imageCredit: o.imageCredit,
    eligibility: o.eligibility.join("\n"),
    benefits: o.benefits.join("\n"),
    process: o.process.join("\n"),
  };
}

/**
 * Create-or-edit form for an opportunity. Pass `editing` to pre-fill and save
 * with PATCH instead of POST. Mount with a `key` that changes when switching
 * which item is being edited (or back to "new"), so the form's internal
 * state resets cleanly — see the Manage panel below.
 */
export function OpportunityForm({
  token,
  editing,
  onCancelEdit,
  onSaved,
}: {
  token: string;
  editing?: EditableOpportunity | null;
  onCancelEdit?: () => void;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => (editing ? formFromOpportunity(editing) : emptyForm()));
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const [published, setPublished] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setState("loading");
    setError("");
    setPublished(null);
    try {
      const url = editing
        ? `/api/admin/t/${encodeURIComponent(token)}/opportunities/${editing.id}`
        : `/api/admin/t/${encodeURIComponent(token)}/opportunities`;
      const res = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not save");
        setState("error");
        return;
      }
      setPublished(data.slug);
      setState("idle");
      router.refresh();
      if (editing) {
        onSaved?.();
      } else {
        setForm(emptyForm());
      }
    } catch {
      setError("Network error — please try again");
      setState("error");
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {published && (
        <div className="flex flex-wrap items-center justify-between gap-3 border border-brand bg-tint px-4 py-3">
          <p className="flex items-center gap-2 text-[0.875rem] font-semibold text-brand-dark">
            <Check className="h-4 w-4" strokeWidth={2.6} />
            {editing ? "Changes saved." : "Published and live on the site."}
          </p>
          <a
            href={`/opportunities/${published}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-brand hover:underline"
          >
            View opportunity <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block md:col-span-2">
          <span className="label">Opportunity title *</span>
          <input
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            className={`${input} mt-2`}
            placeholder="e.g. Mandela Washington Fellowship 2027"
          />
        </label>
        <label className="block">
          <span className="label">Organization *</span>
          <input
            value={form.organization}
            onChange={(e) => set("organization", e.target.value)}
            className={`${input} mt-2`}
            placeholder="Hosting body"
          />
        </label>
        <label className="block">
          <span className="label">Opportunity type *</span>
          <select
            value={form.oppType}
            onChange={(e) => set("oppType", e.target.value)}
            className={`${input} mt-2 appearance-none`}
          >
            {OPP_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label">Country / region *</span>
          <input
            value={form.region}
            onChange={(e) => set("region", e.target.value)}
            className={`${input} mt-2`}
            placeholder="e.g. Africa, Global, Nigeria"
          />
        </label>
        <label className="block">
          <span className="label">Deadline * (YYYY-MM-DD)</span>
          <input
            type="date"
            value={form.deadline}
            onChange={(e) => set("deadline", e.target.value)}
            className={`${input} mt-2`}
          />
        </label>
        <label className="block md:col-span-2">
          <span className="label">Short summary *</span>
          <textarea
            rows={3}
            value={form.summary}
            onChange={(e) => set("summary", e.target.value)}
            className={`${area} mt-2`}
            placeholder="One or two sentences describing the opportunity."
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="block">
          <span className="label">Eligibility * (one per line)</span>
          <textarea
            rows={6}
            value={form.eligibility}
            onChange={(e) => set("eligibility", e.target.value)}
            className={`${area} mt-2`}
            placeholder={"Aged 18–35\nAfrican citizen\n…"}
          />
        </label>
        <label className="block">
          <span className="label">Benefits * (one per line)</span>
          <textarea
            rows={6}
            value={form.benefits}
            onChange={(e) => set("benefits", e.target.value)}
            className={`${area} mt-2`}
            placeholder={"Full funding\nMentorship\n…"}
          />
        </label>
        <label className="block">
          <span className="label">Application process * (one per line)</span>
          <textarea
            rows={6}
            value={form.process}
            onChange={(e) => set("process", e.target.value)}
            className={`${area} mt-2`}
            placeholder={"Create an account\nSubmit essays\n…"}
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="label">Official application link *</span>
          <input
            value={form.applyUrl}
            onChange={(e) => set("applyUrl", e.target.value)}
            className={`${input} mt-2`}
            placeholder="https://…"
          />
        </label>
        <label className="block">
          <span className="label">Official source URL *</span>
          <input
            value={form.sourceUrl}
            onChange={(e) => set("sourceUrl", e.target.value)}
            className={`${input} mt-2`}
            placeholder="https://…"
          />
        </label>
        <label className="block">
          <span className="label">Official source name *</span>
          <input
            value={form.sourceName}
            onChange={(e) => set("sourceName", e.target.value)}
            className={`${input} mt-2`}
            placeholder="e.g. mandelawashingtonfellowship.org"
          />
        </label>
        <div className="block md:col-span-2">
          <ImageUploadField
            image={form.image}
            onImageChange={(v) => set("image", v)}
            imageCredit={form.imageCredit}
            onImageCreditChange={(v) => set("imageCredit", v)}
          />
        </div>
      </div>

      {error && (
        <p className="border-l-2 border-accent bg-accent/5 px-4 py-2.5 text-[0.8125rem] text-accent">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={state === "loading"}
          className="inline-flex min-h-[3.25rem] items-center justify-center gap-2 bg-brand px-7 text-[0.9375rem] font-semibold text-paper transition-colors hover:bg-brand-dark disabled:opacity-70"
        >
          {editing
            ? state === "loading"
              ? "Saving…"
              : "Save changes"
            : state === "loading"
              ? "Publishing…"
              : "Publish opportunity"}
          {editing ? <Save className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
        </button>
        {editing ? (
          <button
            type="button"
            onClick={onCancelEdit}
            className="inline-flex min-h-[3.25rem] items-center gap-1.5 px-5 text-[0.875rem] font-medium text-muted transition-colors hover:text-ink"
          >
            <X className="h-4 w-4" /> Cancel
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setForm(emptyForm())}
            className="inline-flex min-h-[3.25rem] items-center px-5 text-[0.875rem] font-medium text-muted transition-colors hover:text-ink"
          >
            Clear
          </button>
        )}
      </div>
    </form>
  );
}

export type EditableScholarship = {
  id: number;
  slug: string;
  title: string;
  provider: string;
  country: string;
  studyLevel: string;
  fundingType: string;
  applicants: string;
  summary: string;
  deadline: string;
  benefits: string[];
  requirements: string[];
  documents: string[];
  howToApply: string[];
  applyUrl: string;
  sourceName: string;
  sourceUrl: string;
  image: string;
  imageCredit: string;
  featured: boolean;
};

type ScholarshipFormState = {
  title: string;
  provider: string;
  country: string;
  studyLevel: string;
  fundingType: string;
  applicants: string;
  summary: string;
  deadline: string;
  benefits: string;
  requirements: string;
  documents: string;
  howToApply: string;
  applyUrl: string;
  sourceName: string;
  sourceUrl: string;
  image: string;
  imageCredit: string;
  featured: boolean;
};

function emptyScholarshipForm(): ScholarshipFormState {
  return {
    title: "",
    provider: "",
    country: "",
    studyLevel: "Undergraduate",
    fundingType: "Fully funded",
    applicants: "",
    summary: "",
    deadline: "",
    benefits: "",
    requirements: "",
    documents: "",
    howToApply: "",
    applyUrl: "",
    sourceName: "",
    sourceUrl: "",
    image: "",
    imageCredit: "",
    featured: false,
  };
}

function formFromScholarship(s: EditableScholarship): ScholarshipFormState {
  return {
    title: s.title,
    provider: s.provider,
    country: s.country,
    studyLevel: s.studyLevel,
    fundingType: s.fundingType,
    applicants: s.applicants,
    summary: s.summary,
    deadline: s.deadline,
    benefits: s.benefits.join("\n"),
    requirements: s.requirements.join("\n"),
    documents: s.documents.join("\n"),
    howToApply: s.howToApply.join("\n"),
    applyUrl: s.applyUrl,
    sourceName: s.sourceName,
    sourceUrl: s.sourceUrl,
    image: s.image,
    imageCredit: s.imageCredit,
    featured: s.featured,
  };
}

/** Create-or-edit form for a scholarship. Same pattern as OpportunityForm above. */
export function ScholarshipForm({
  token,
  editing,
  onCancelEdit,
  onSaved,
}: {
  token: string;
  editing?: EditableScholarship | null;
  onCancelEdit?: () => void;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState<ScholarshipFormState>(() =>
    editing ? formFromScholarship(editing) : emptyScholarshipForm(),
  );
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const [published, setPublished] = useState<string | null>(null);

  function set<K extends keyof ScholarshipFormState>(key: K, value: ScholarshipFormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setState("loading");
    setError("");
    setPublished(null);
    try {
      const url = editing
        ? `/api/admin/t/${encodeURIComponent(token)}/scholarships/${editing.id}`
        : `/api/admin/t/${encodeURIComponent(token)}/scholarships`;
      const res = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not save");
        setState("error");
        return;
      }
      setPublished(data.slug);
      setState("idle");
      router.refresh();
      if (editing) {
        onSaved?.();
      } else {
        setForm(emptyScholarshipForm());
      }
    } catch {
      setError("Network error — please try again");
      setState("error");
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {published && (
        <div className="flex flex-wrap items-center justify-between gap-3 border border-brand bg-tint px-4 py-3">
          <p className="flex items-center gap-2 text-[0.875rem] font-semibold text-brand-dark">
            <Check className="h-4 w-4" strokeWidth={2.6} />
            {editing ? "Changes saved." : "Published and live on the site."}
          </p>
          <a
            href={`/scholarships/${published}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-brand hover:underline"
          >
            View scholarship <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block md:col-span-2">
          <span className="label">Scholarship title *</span>
          <input
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            className={`${input} mt-2`}
            placeholder="e.g. Chevening Scholarships 2027"
          />
        </label>
        <label className="block">
          <span className="label">Provider *</span>
          <input
            value={form.provider}
            onChange={(e) => set("provider", e.target.value)}
            className={`${input} mt-2`}
            placeholder="Awarding body"
          />
        </label>
        <label className="block">
          <span className="label">Country *</span>
          <input
            value={form.country}
            onChange={(e) => set("country", e.target.value)}
            className={`${input} mt-2`}
            placeholder="e.g. United Kingdom"
          />
        </label>
        <label className="block">
          <span className="label">Study level</span>
          <select
            value={form.studyLevel}
            onChange={(e) => set("studyLevel", e.target.value)}
            className={`${input} mt-2 appearance-none`}
          >
            {STUDY_LEVELS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label">Funding type</span>
          <select
            value={form.fundingType}
            onChange={(e) => set("fundingType", e.target.value)}
            className={`${input} mt-2 appearance-none`}
          >
            {FUNDING_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label">Open to *</span>
          <input
            value={form.applicants}
            onChange={(e) => set("applicants", e.target.value)}
            className={`${input} mt-2`}
            placeholder="e.g. African students, Commonwealth citizens"
          />
        </label>
        <label className="block">
          <span className="label">Deadline * (YYYY-MM-DD)</span>
          <input
            type="date"
            value={form.deadline}
            onChange={(e) => set("deadline", e.target.value)}
            className={`${input} mt-2`}
          />
        </label>
        <label className="flex items-center gap-2 self-end pb-3">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => set("featured", e.target.checked)}
            className="h-4 w-4 accent-brand"
          />
          <span className="text-[0.875rem] text-ink">Feature this scholarship</span>
        </label>
        <label className="block md:col-span-2">
          <span className="label">Short summary *</span>
          <textarea
            rows={3}
            value={form.summary}
            onChange={(e) => set("summary", e.target.value)}
            className={`${area} mt-2`}
            placeholder="One or two sentences describing the scholarship."
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="label">Benefits * (one per line)</span>
          <textarea
            rows={5}
            value={form.benefits}
            onChange={(e) => set("benefits", e.target.value)}
            className={`${area} mt-2`}
            placeholder={"Full tuition\nMonthly stipend\n…"}
          />
        </label>
        <label className="block">
          <span className="label">Eligibility / requirements * (one per line)</span>
          <textarea
            rows={5}
            value={form.requirements}
            onChange={(e) => set("requirements", e.target.value)}
            className={`${area} mt-2`}
            placeholder={"Bachelor's degree\nUnder 35 years old\n…"}
          />
        </label>
        <label className="block">
          <span className="label">Required documents * (one per line)</span>
          <textarea
            rows={5}
            value={form.documents}
            onChange={(e) => set("documents", e.target.value)}
            className={`${area} mt-2`}
            placeholder={"Academic transcripts\nTwo reference letters\n…"}
          />
        </label>
        <label className="block">
          <span className="label">How to apply * (one step per line)</span>
          <textarea
            rows={5}
            value={form.howToApply}
            onChange={(e) => set("howToApply", e.target.value)}
            className={`${area} mt-2`}
            placeholder={"Create an online account\nComplete the form\n…"}
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="label">Official application link *</span>
          <input
            value={form.applyUrl}
            onChange={(e) => set("applyUrl", e.target.value)}
            className={`${input} mt-2`}
            placeholder="https://…"
          />
        </label>
        <label className="block">
          <span className="label">Official source URL *</span>
          <input
            value={form.sourceUrl}
            onChange={(e) => set("sourceUrl", e.target.value)}
            className={`${input} mt-2`}
            placeholder="https://…"
          />
        </label>
        <label className="block">
          <span className="label">Official source name *</span>
          <input
            value={form.sourceName}
            onChange={(e) => set("sourceName", e.target.value)}
            className={`${input} mt-2`}
            placeholder="e.g. chevening.org"
          />
        </label>
        <div className="block md:col-span-2">
          <ImageUploadField
            image={form.image}
            onImageChange={(v) => set("image", v)}
            imageCredit={form.imageCredit}
            onImageCreditChange={(v) => set("imageCredit", v)}
          />
        </div>
      </div>

      {error && (
        <p className="border-l-2 border-accent bg-accent/5 px-4 py-2.5 text-[0.8125rem] text-accent">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={state === "loading"}
          className="inline-flex min-h-[3.25rem] items-center justify-center gap-2 bg-brand px-7 text-[0.9375rem] font-semibold text-paper transition-colors hover:bg-brand-dark disabled:opacity-70"
        >
          {editing
            ? state === "loading"
              ? "Saving…"
              : "Save changes"
            : state === "loading"
              ? "Publishing…"
              : "Publish scholarship"}
          {editing ? <Save className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
        </button>
        {editing ? (
          <button
            type="button"
            onClick={onCancelEdit}
            className="inline-flex min-h-[3.25rem] items-center gap-1.5 px-5 text-[0.875rem] font-medium text-muted transition-colors hover:text-ink"
          >
            <X className="h-4 w-4" /> Cancel
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setForm(emptyScholarshipForm())}
            className="inline-flex min-h-[3.25rem] items-center px-5 text-[0.875rem] font-medium text-muted transition-colors hover:text-ink"
          >
            Clear
          </button>
        )}
      </div>
    </form>
  );
}

export type EditableSchoolUpdate = {
  id: number;
  slug: string;
  school: string;
  title: string;
  session: string;
  category: string;
  summary: string;
  appliesTo: string;
  dates: { label: string; value: string }[];
  requirements: string[];
  steps: string[];
  sourceName: string;
  sourceUrl: string;
  image: string;
  imageCredit: string;
};

type SchoolUpdateFormState = {
  school: string;
  title: string;
  session: string;
  category: string;
  summary: string;
  appliesTo: string;
  dates: string;
  requirements: string;
  steps: string;
  sourceName: string;
  sourceUrl: string;
  image: string;
  imageCredit: string;
};

function emptySchoolUpdateForm(): SchoolUpdateFormState {
  return {
    school: "",
    title: "",
    session: "2025/2026",
    category: "Admissions",
    summary: "",
    appliesTo: "",
    dates: "",
    requirements: "",
    steps: "",
    sourceName: "",
    sourceUrl: "",
    image: "",
    imageCredit: "",
  };
}

function formFromSchoolUpdate(u: EditableSchoolUpdate): SchoolUpdateFormState {
  return {
    school: u.school,
    title: u.title,
    session: u.session,
    category: u.category,
    summary: u.summary,
    appliesTo: u.appliesTo,
    dates: u.dates.map((d) => (d.label ? `${d.label}: ${d.value}` : d.value)).join("\n"),
    requirements: u.requirements.join("\n"),
    steps: u.steps.join("\n"),
    sourceName: u.sourceName,
    sourceUrl: u.sourceUrl,
    image: u.image,
    imageCredit: u.imageCredit,
  };
}

/** Create-or-edit form for a school update. Same pattern as OpportunityForm above. */
export function SchoolUpdateForm({
  token,
  editing,
  onCancelEdit,
  onSaved,
}: {
  token: string;
  editing?: EditableSchoolUpdate | null;
  onCancelEdit?: () => void;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState<SchoolUpdateFormState>(() =>
    editing ? formFromSchoolUpdate(editing) : emptySchoolUpdateForm(),
  );
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const [published, setPublished] = useState<string | null>(null);

  function set<K extends keyof SchoolUpdateFormState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setState("loading");
    setError("");
    setPublished(null);
    try {
      const url = editing
        ? `/api/admin/t/${encodeURIComponent(token)}/school-updates/${editing.id}`
        : `/api/admin/t/${encodeURIComponent(token)}/school-updates`;
      const res = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not save");
        setState("error");
        return;
      }
      setPublished(data.slug);
      setState("idle");
      router.refresh();
      if (editing) {
        onSaved?.();
      } else {
        setForm(emptySchoolUpdateForm());
      }
    } catch {
      setError("Network error — please try again");
      setState("error");
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {published && (
        <div className="flex flex-wrap items-center justify-between gap-3 border border-brand bg-tint px-4 py-3">
          <p className="flex items-center gap-2 text-[0.875rem] font-semibold text-brand-dark">
            <Check className="h-4 w-4" strokeWidth={2.6} />
            {editing ? "Changes saved." : "Published and live on the site."}
          </p>
          <a
            href={`/school-updates/${published}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-brand hover:underline"
          >
            View update <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="label">School / institution *</span>
          <input
            value={form.school}
            onChange={(e) => set("school", e.target.value)}
            className={`${input} mt-2`}
            placeholder="e.g. University of Lagos"
          />
        </label>
        <label className="block">
          <span className="label">Update title *</span>
          <input
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            className={`${input} mt-2`}
            placeholder="e.g. Second semester registration extended"
          />
        </label>
        <label className="block">
          <span className="label">Academic session</span>
          <input
            value={form.session}
            onChange={(e) => set("session", e.target.value)}
            className={`${input} mt-2`}
            placeholder="e.g. 2025/2026"
          />
        </label>
        <label className="block">
          <span className="label">Category</span>
          <select
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            className={`${input} mt-2 appearance-none`}
          >
            {CATEGORIES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label className="block md:col-span-2">
          <span className="label">Applies to *</span>
          <input
            value={form.appliesTo}
            onChange={(e) => set("appliesTo", e.target.value)}
            className={`${input} mt-2`}
            placeholder="e.g. All returning students, Final-year students"
          />
        </label>
        <label className="block md:col-span-2">
          <span className="label">Short summary *</span>
          <textarea
            rows={3}
            value={form.summary}
            onChange={(e) => set("summary", e.target.value)}
            className={`${area} mt-2`}
            placeholder="What changed and why it matters."
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="block">
          <span className="label">Key dates * — one per line, as “Label: date”</span>
          <textarea
            rows={5}
            value={form.dates}
            onChange={(e) => set("dates", e.target.value)}
            className={`${area} mt-2`}
            placeholder={"Registration opens: 1 Oct 2026\nDeadline: 15 Oct 2026\n…"}
          />
        </label>
        <label className="block">
          <span className="label">Requirements (one per line, optional)</span>
          <textarea
            rows={5}
            value={form.requirements}
            onChange={(e) => set("requirements", e.target.value)}
            className={`${area} mt-2`}
            placeholder={"Valid student ID\nCleared fees\n…"}
          />
        </label>
        <label className="block">
          <span className="label">What to do (one step per line, optional)</span>
          <textarea
            rows={5}
            value={form.steps}
            onChange={(e) => set("steps", e.target.value)}
            className={`${area} mt-2`}
            placeholder={"Log in to the student portal\nUpload documents\n…"}
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="label">Official source URL *</span>
          <input
            value={form.sourceUrl}
            onChange={(e) => set("sourceUrl", e.target.value)}
            className={`${input} mt-2`}
            placeholder="https://…"
          />
        </label>
        <label className="block">
          <span className="label">Official source name *</span>
          <input
            value={form.sourceName}
            onChange={(e) => set("sourceName", e.target.value)}
            className={`${input} mt-2`}
            placeholder="e.g. unilag.edu.ng"
          />
        </label>
        <div className="block md:col-span-2">
          <ImageUploadField
            image={form.image}
            onImageChange={(v) => set("image", v)}
            imageCredit={form.imageCredit}
            onImageCreditChange={(v) => set("imageCredit", v)}
          />
        </div>
      </div>

      {error && (
        <p className="border-l-2 border-accent bg-accent/5 px-4 py-2.5 text-[0.8125rem] text-accent">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={state === "loading"}
          className="inline-flex min-h-[3.25rem] items-center justify-center gap-2 bg-brand px-7 text-[0.9375rem] font-semibold text-paper transition-colors hover:bg-brand-dark disabled:opacity-70"
        >
          {editing
            ? state === "loading"
              ? "Saving…"
              : "Save changes"
            : state === "loading"
              ? "Publishing…"
              : "Publish update"}
          {editing ? <Save className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
        </button>
        {editing ? (
          <button
            type="button"
            onClick={onCancelEdit}
            className="inline-flex min-h-[3.25rem] items-center gap-1.5 px-5 text-[0.875rem] font-medium text-muted transition-colors hover:text-ink"
          >
            <X className="h-4 w-4" /> Cancel
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setForm(emptySchoolUpdateForm())}
            className="inline-flex min-h-[3.25rem] items-center px-5 text-[0.875rem] font-medium text-muted transition-colors hover:text-ink"
          >
            Clear
          </button>
        )}
      </div>
    </form>
  );
}

export function ChangePasswordForm({ token }: { token: string }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (next !== confirm) {
      setError("The two new passwords do not match");
      setState("error");
      return;
    }
    setState("loading");
    try {
      const res = await fetch(`/api/admin/t/${encodeURIComponent(token)}/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current, next }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not update password");
        setState("error");
        return;
      }
      setState("done");
      setCurrent("");
      setNext("");
      setConfirm("");
      // The password change rotates the session: continue on the new path token.
      if (typeof data.token === "string") {
        window.location.replace(`/admin/t/${encodeURIComponent(data.token)}`);
      }
    } catch {
      setError("Network error — please try again");
      setState("error");
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {state === "done" && (
        <p className="flex items-center gap-2 border border-brand bg-tint px-4 py-2.5 text-[0.8125rem] font-semibold text-brand-dark">
          <Check className="h-4 w-4" strokeWidth={2.6} /> Password updated.
        </p>
      )}
      <label className="block">
        <span className="label">Current password</span>
        <input
          type="password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          autoComplete="current-password"
          className={`${input} mt-2`}
        />
      </label>
      <label className="block">
        <span className="label">New password</span>
        <input
          type="password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
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
        <p
          role="alert"
          className="border-l-2 border-accent bg-accent/5 px-4 py-2.5 text-[0.8125rem] text-accent"
        >
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={state === "loading"}
        className="inline-flex min-h-[3.25rem] items-center justify-center gap-2 bg-ink px-6 text-[0.9375rem] font-semibold text-paper transition-colors hover:bg-brand-dark disabled:opacity-70"
      >
        {state === "loading" ? "Updating…" : "Update password"}
        <KeyRound className="h-4 w-4" />
      </button>
    </form>
  );
}
