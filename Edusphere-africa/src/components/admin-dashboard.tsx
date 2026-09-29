"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Copy,
  Check,
  Download,
  Users,
  Mail,
  Settings,
  Pencil,
  Trash2,
  FolderOpen,
  GraduationCap,
  Newspaper,
} from "lucide-react";
import {
  OpportunityForm,
  ScholarshipForm,
  SchoolUpdateForm,
  ChangePasswordForm,
  type EditableOpportunity,
  type EditableScholarship,
  type EditableSchoolUpdate,
} from "@/components/admin-forms";
import type { Opportunity, Scholarship, SchoolUpdate } from "@/db/schema";

type Subscriber = { id: number; email: string; createdAt: string };
type Submission = {
  id: number;
  name: string;
  email: string;
  type: string;
  message: string;
  createdAt: string;
};

const fmt = (iso: string) => {
  const d = new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const TABS = [
  { id: "subscribers", label: "Subscribers", icon: Users },
  { id: "messages", label: "Messages", icon: Mail },
  { id: "opportunities", label: "Opportunities", icon: FolderOpen },
  { id: "scholarships", label: "Scholarships", icon: GraduationCap },
  { id: "school-updates", label: "School updates", icon: Newspaper },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function AdminDashboard({
  token,
  subscribers,
  submissions,
  oppCount,
  opportunities,
  scholarships,
  schoolUpdates,
}: {
  token: string;
  subscribers: Subscriber[];
  submissions: Submission[];
  oppCount: number;
  opportunities: Opportunity[];
  scholarships: Scholarship[];
  schoolUpdates: SchoolUpdate[];
}) {
  const [tab, setTab] = useState<TabId>("subscribers");

  return (
    <div>
      <div className="grid grid-cols-2 gap-px border border-rule bg-rule md:grid-cols-4">
        <Stat label="Subscribers" value={subscribers.length} />
        <Stat label="Messages" value={submissions.length} />
        <Stat label="Live opportunities" value={oppCount} />
        <Stat label="Signups this month" value={countThisMonth(subscribers)} />
      </div>

      <div className="mt-8 flex flex-wrap gap-2 border-b border-rule pb-4">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`inline-flex min-h-[2.75rem] items-center gap-2 border px-4 text-[0.8125rem] font-semibold transition-colors ${
              tab === id
                ? "border-brand bg-brand text-paper"
                : "border-rule-strong bg-card text-muted hover:border-ink hover:text-ink"
            }`}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === "subscribers" && <SubscribersPanel subscribers={subscribers} />}
        {tab === "messages" && <MessagesPanel submissions={submissions} />}
        {tab === "opportunities" && <OpportunitiesPanel token={token} opportunities={opportunities} />}
        {tab === "scholarships" && <ScholarshipsPanel token={token} scholarships={scholarships} />}
        {tab === "school-updates" && <SchoolUpdatesPanel token={token} schoolUpdates={schoolUpdates} />}
        {tab === "settings" && (
          <Panel
            title="Change your password"
            subtitle="Update the password you use to sign in to the admin desk."
          >
            <div className="max-w-md">
              <ChangePasswordForm token={token} />
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-paper px-5 py-5">
      <p className="text-[1.75rem] font-semibold leading-none text-brand tnum">{value}</p>
      <p className="label mt-2">{label}</p>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-rule bg-card p-6 md:p-8">
      <h2 className="text-[clamp(1.35rem,4vw,1.9rem)] leading-tight text-ink">{title}</h2>
      <p className="mt-2 text-[0.9375rem] text-muted">{subtitle}</p>
      <div className="mt-7">{children}</div>
    </section>
  );
}

function SubscribersPanel({ subscribers }: { subscribers: Subscriber[] }) {
  const [q, setQ] = useState("");
  const [copied, setCopied] = useState(false);

  const filtered = useMemo(
    () => subscribers.filter((s) => s.email.toLowerCase().includes(q.trim().toLowerCase())),
    [subscribers, q],
  );

  function copy() {
    navigator.clipboard?.writeText(filtered.map((s) => s.email).join(", "));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function downloadCsv() {
    const rows = [["email", "subscribed_on"], ...filtered.map((s) => [s.email, s.createdAt])];
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "edusphere-subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="border border-rule bg-card">
      <div className="flex flex-col gap-3 border-b border-rule p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[1.35rem] leading-tight text-ink">Newsletter subscribers</h2>
          <p className="mt-1 text-[0.8125rem] text-muted">
            {subscribers.length} total · people who opted into the weekly digest.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copy}
            disabled={!filtered.length}
            className="inline-flex h-11 items-center gap-2 border border-rule-strong px-4 text-[0.8125rem] font-semibold text-ink transition-colors hover:border-brand disabled:opacity-50"
          >
            {copied ? <Check className="h-4 w-4 text-brand" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy emails"}
          </button>
          <button
            type="button"
            onClick={downloadCsv}
            disabled={!filtered.length}
            className="inline-flex h-11 items-center gap-2 bg-brand px-4 text-[0.8125rem] font-semibold text-paper transition-colors hover:bg-brand-dark disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="p-5">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter by email…"
          className="mb-4 h-11 w-full max-w-sm border border-rule-strong bg-paper px-3.5 text-[0.875rem] text-ink placeholder:text-muted/70 focus:border-brand focus:outline-none"
        />

        {filtered.length === 0 ? (
          <p className="border border-dashed border-rule-strong p-8 text-center text-[0.9375rem] text-muted">
            {subscribers.length === 0 ? "No subscribers yet." : "No emails match your filter."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[30rem] border-collapse text-left">
              <thead>
                <tr className="border-b border-rule-strong">
                  <th className="label py-2.5 pr-4">#</th>
                  <th className="label py-2.5 pr-4">Email address</th>
                  <th className="label py-2.5">Subscribed</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.id} className="border-b border-rule last:border-0">
                    <td className="py-3 pr-4 text-[0.8125rem] text-muted tnum">{i + 1}</td>
                    <td className="py-3 pr-4 text-[0.9375rem] text-ink">{s.email}</td>
                    <td className="py-3 text-[0.8125rem] text-muted tnum">{fmt(s.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

function OpportunitiesPanel({ token, opportunities }: { token: string; opportunities: Opportunity[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState("");

  const editing = opportunities.find((o) => o.id === editingId) ?? null;
  const editable: EditableOpportunity | null = editing
    ? {
        id: editing.id,
        slug: editing.slug,
        title: editing.title,
        organization: editing.organization,
        oppType: editing.oppType,
        region: editing.region,
        summary: editing.summary,
        deadline: editing.deadline,
        applyUrl: editing.applyUrl,
        sourceName: editing.sourceName,
        sourceUrl: editing.sourceUrl,
        image: editing.image,
        imageCredit: editing.imageCredit,
        eligibility: editing.eligibility,
        benefits: editing.benefits,
        process: editing.process,
      }
    : null;

  async function remove(id: number) {
    if (!window.confirm("Remove this opportunity from the site? This cannot be undone.")) return;
    setDeletingId(id);
    setDeleteError("");
    try {
      const res = await fetch(`/api/admin/t/${encodeURIComponent(token)}/opportunities/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setDeleteError(data?.error || "Could not remove that opportunity");
        return;
      }
      if (editingId === id) setEditingId(null);
      router.refresh();
    } catch {
      setDeleteError("Network error — please try again");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <Panel
        title={editable ? `Editing “${editable.title}”` : "Publish a new opportunity"}
        subtitle={
          editable
            ? "Changes go live on the site as soon as you save."
            : "It goes live on the site immediately and appears on the Opportunities page."
        }
      >
        <OpportunityForm
          key={editable ? `edit-${editable.id}` : "new"}
          token={token}
          editing={editable}
          onCancelEdit={() => setEditingId(null)}
          onSaved={() => setEditingId(null)}
        />
      </Panel>

      <section className="border border-rule bg-card">
        <div className="border-b border-rule p-5">
          <h2 className="text-[1.35rem] leading-tight text-ink">Published opportunities</h2>
          <p className="mt-1 text-[0.8125rem] text-muted">
            {opportunities.length} total · edit or remove anything published from this admin desk.
          </p>
        </div>
        {deleteError && (
          <p className="border-b border-rule bg-accent/5 px-5 py-3 text-[0.8125rem] text-accent">{deleteError}</p>
        )}
        <div className="p-5">
          {opportunities.length === 0 ? (
            <p className="border border-dashed border-rule-strong p-8 text-center text-[0.9375rem] text-muted">
              Nothing published from this desk yet. Use the form above to add the first one.
            </p>
          ) : (
            <ul className="divide-y divide-rule">
              {opportunities.map((o) => (
                <li key={o.id} className="flex flex-wrap items-center gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="h-14 w-20 shrink-0 overflow-hidden border border-rule bg-tint">
                    <img src={o.image} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-[12rem] flex-1">
                    <p className="text-[0.9375rem] font-semibold text-ink">{o.title}</p>
                    <p className="mt-0.5 text-[0.8125rem] text-muted">
                      {o.organization} · {o.oppType} · {o.region}
                    </p>
                  </div>
                  <p className="text-[0.8125rem] text-muted tnum">Deadline {fmt(o.deadline)}</p>
                  <div className="ml-auto flex items-center gap-2">
                    <a
                      href={`/opportunities/${o.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-9 items-center px-3 text-[0.8125rem] font-medium text-muted transition-colors hover:text-ink"
                    >
                      View
                    </a>
                    <button
                      type="button"
                      onClick={() => setEditingId(o.id)}
                      className="inline-flex h-9 items-center gap-1.5 border border-rule-strong px-3 text-[0.8125rem] font-semibold text-ink transition-colors hover:border-brand"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(o.id)}
                      disabled={deletingId === o.id}
                      className="inline-flex h-9 items-center gap-1.5 border border-rule-strong px-3 text-[0.8125rem] font-semibold text-accent transition-colors hover:border-accent disabled:opacity-60"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> {deletingId === o.id ? "Removing…" : "Delete"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

function ScholarshipsPanel({ token, scholarships }: { token: string; scholarships: Scholarship[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState("");

  const editing = scholarships.find((s) => s.id === editingId) ?? null;
  const editable: EditableScholarship | null = editing
    ? {
        id: editing.id,
        slug: editing.slug,
        title: editing.title,
        provider: editing.provider,
        country: editing.country,
        studyLevel: editing.studyLevel,
        fundingType: editing.fundingType,
        applicants: editing.applicants,
        summary: editing.summary,
        deadline: editing.deadline,
        benefits: editing.benefits,
        requirements: editing.requirements,
        documents: editing.documents,
        howToApply: editing.howToApply,
        applyUrl: editing.applyUrl,
        sourceName: editing.sourceName,
        sourceUrl: editing.sourceUrl,
        image: editing.image,
        imageCredit: editing.imageCredit,
        featured: editing.featured,
      }
    : null;

  async function remove(id: number) {
    if (!window.confirm("Remove this scholarship from the site? This cannot be undone.")) return;
    setDeletingId(id);
    setDeleteError("");
    try {
      const res = await fetch(`/api/admin/t/${encodeURIComponent(token)}/scholarships/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setDeleteError(data?.error || "Could not remove that scholarship");
        return;
      }
      if (editingId === id) setEditingId(null);
      router.refresh();
    } catch {
      setDeleteError("Network error — please try again");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <Panel
        title={editable ? `Editing “${editable.title}”` : "Publish a new scholarship"}
        subtitle={
          editable
            ? "Changes go live on the site as soon as you save."
            : "It goes live on the site immediately and appears on the Scholarships page."
        }
      >
        <ScholarshipForm
          key={editable ? `edit-${editable.id}` : "new"}
          token={token}
          editing={editable}
          onCancelEdit={() => setEditingId(null)}
          onSaved={() => setEditingId(null)}
        />
      </Panel>

      <section className="border border-rule bg-card">
        <div className="border-b border-rule p-5">
          <h2 className="text-[1.35rem] leading-tight text-ink">Published scholarships</h2>
          <p className="mt-1 text-[0.8125rem] text-muted">
            {scholarships.length} total · edit or remove anything published from this admin desk.
          </p>
        </div>
        {deleteError && (
          <p className="border-b border-rule bg-accent/5 px-5 py-3 text-[0.8125rem] text-accent">{deleteError}</p>
        )}
        <div className="p-5">
          {scholarships.length === 0 ? (
            <p className="border border-dashed border-rule-strong p-8 text-center text-[0.9375rem] text-muted">
              Nothing published from this desk yet. Use the form above to add the first one.
            </p>
          ) : (
            <ul className="divide-y divide-rule">
              {scholarships.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="h-14 w-20 shrink-0 overflow-hidden border border-rule bg-tint">
                    <img src={s.image} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-[12rem] flex-1">
                    <p className="text-[0.9375rem] font-semibold text-ink">{s.title}</p>
                    <p className="mt-0.5 text-[0.8125rem] text-muted">
                      {s.provider} · {s.country} · {s.studyLevel}
                    </p>
                  </div>
                  <p className="text-[0.8125rem] text-muted tnum">Deadline {fmt(s.deadline)}</p>
                  <div className="ml-auto flex items-center gap-2">
                    <a
                      href={`/scholarships/${s.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-9 items-center px-3 text-[0.8125rem] font-medium text-muted transition-colors hover:text-ink"
                    >
                      View
                    </a>
                    <button
                      type="button"
                      onClick={() => setEditingId(s.id)}
                      className="inline-flex h-9 items-center gap-1.5 border border-rule-strong px-3 text-[0.8125rem] font-semibold text-ink transition-colors hover:border-brand"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(s.id)}
                      disabled={deletingId === s.id}
                      className="inline-flex h-9 items-center gap-1.5 border border-rule-strong px-3 text-[0.8125rem] font-semibold text-accent transition-colors hover:border-accent disabled:opacity-60"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> {deletingId === s.id ? "Removing…" : "Delete"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

function SchoolUpdatesPanel({ token, schoolUpdates }: { token: string; schoolUpdates: SchoolUpdate[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState("");

  const editing = schoolUpdates.find((u) => u.id === editingId) ?? null;
  const editable: EditableSchoolUpdate | null = editing
    ? {
        id: editing.id,
        slug: editing.slug,
        school: editing.school,
        title: editing.title,
        session: editing.session,
        category: editing.category,
        summary: editing.summary,
        appliesTo: editing.appliesTo,
        dates: editing.dates,
        requirements: editing.requirements,
        steps: editing.steps,
        sourceName: editing.sourceName,
        sourceUrl: editing.sourceUrl,
        image: editing.image,
        imageCredit: editing.imageCredit,
      }
    : null;

  async function remove(id: number) {
    if (!window.confirm("Remove this update from the site? This cannot be undone.")) return;
    setDeletingId(id);
    setDeleteError("");
    try {
      const res = await fetch(`/api/admin/t/${encodeURIComponent(token)}/school-updates/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setDeleteError(data?.error || "Could not remove that update");
        return;
      }
      if (editingId === id) setEditingId(null);
      router.refresh();
    } catch {
      setDeleteError("Network error — please try again");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <Panel
        title={editable ? `Editing “${editable.title}”` : "Publish a new school update"}
        subtitle={
          editable
            ? "Changes go live on the site as soon as you save."
            : "It goes live on the site immediately and appears on the School Updates page."
        }
      >
        <SchoolUpdateForm
          key={editable ? `edit-${editable.id}` : "new"}
          token={token}
          editing={editable}
          onCancelEdit={() => setEditingId(null)}
          onSaved={() => setEditingId(null)}
        />
      </Panel>

      <section className="border border-rule bg-card">
        <div className="border-b border-rule p-5">
          <h2 className="text-[1.35rem] leading-tight text-ink">Published school updates</h2>
          <p className="mt-1 text-[0.8125rem] text-muted">
            {schoolUpdates.length} total · edit or remove anything published from this admin desk.
          </p>
        </div>
        {deleteError && (
          <p className="border-b border-rule bg-accent/5 px-5 py-3 text-[0.8125rem] text-accent">{deleteError}</p>
        )}
        <div className="p-5">
          {schoolUpdates.length === 0 ? (
            <p className="border border-dashed border-rule-strong p-8 text-center text-[0.9375rem] text-muted">
              Nothing published from this desk yet. Use the form above to add the first one.
            </p>
          ) : (
            <ul className="divide-y divide-rule">
              {schoolUpdates.map((u) => (
                <li key={u.id} className="flex flex-wrap items-center gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="h-14 w-20 shrink-0 overflow-hidden border border-rule bg-tint">
                    <img src={u.image} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-[12rem] flex-1">
                    <p className="text-[0.9375rem] font-semibold text-ink">{u.title}</p>
                    <p className="mt-0.5 text-[0.8125rem] text-muted">
                      {u.school} · {u.category} · {u.session}
                    </p>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <a
                      href={`/school-updates/${u.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-9 items-center px-3 text-[0.8125rem] font-medium text-muted transition-colors hover:text-ink"
                    >
                      View
                    </a>
                    <button
                      type="button"
                      onClick={() => setEditingId(u.id)}
                      className="inline-flex h-9 items-center gap-1.5 border border-rule-strong px-3 text-[0.8125rem] font-semibold text-ink transition-colors hover:border-brand"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(u.id)}
                      disabled={deletingId === u.id}
                      className="inline-flex h-9 items-center gap-1.5 border border-rule-strong px-3 text-[0.8125rem] font-semibold text-accent transition-colors hover:border-accent disabled:opacity-60"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> {deletingId === u.id ? "Removing…" : "Delete"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

function MessagesPanel({ submissions }: { submissions: Submission[] }) {
  return (
    <section className="border border-rule bg-card">
      <div className="border-b border-rule p-5">
        <h2 className="text-[1.35rem] leading-tight text-ink">Contact &amp; submissions</h2>
        <p className="mt-1 text-[0.8125rem] text-muted">
          {submissions.length} total · from the contact form and “Submit an Opportunity”.
        </p>
      </div>
      <div className="p-5">
        {submissions.length === 0 ? (
          <p className="border border-dashed border-rule-strong p-8 text-center text-[0.9375rem] text-muted">
            No messages yet.
          </p>
        ) : (
          <ul className="space-y-4">
            {submissions.map((m) => (
              <li key={m.id} className="border border-rule bg-paper p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center border border-brand bg-tint px-2 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-brand">
                      {m.type}
                    </span>
                    <span className="text-[0.9375rem] font-semibold text-ink">{m.name}</span>
                    <a href={`mailto:${m.email}`} className="text-[0.8125rem] text-brand hover:underline">
                      {m.email}
                    </a>
                  </div>
                  <span className="text-[0.75rem] text-muted tnum">{fmt(m.createdAt)}</span>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-[0.9375rem] leading-relaxed text-ink/90">
                  {m.message}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function countThisMonth(subscribers: Subscriber[]): number {
  const now = new Date();
  const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  return subscribers.filter((s) => s.createdAt.startsWith(prefix)).length;
}
