import "server-only";

export const slugify = (input: string) =>
  input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const toLines = (value: unknown) =>
  String(value ?? "")
    .split("\n")
    .map((l) => l.replace(/^[-•\d.\s]+/, "").trim())
    .filter(Boolean);

// Each line "Label: value" (e.g. "Registration opens: 1 Oct 2026") becomes a
// { label, value } pair. A line with no colon is kept with an empty label.
const toDates = (value: unknown) =>
  String(value ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const idx = line.indexOf(":");
      if (idx === -1) return { label: "", value: line };
      return { label: line.slice(0, idx).trim(), value: line.slice(idx + 1).trim() };
    })
    .filter((d) => d.value);

const MAX_IMAGE_CHARS = 4_000_000;

export type SchoolUpdateFields = {
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

export function parseSchoolUpdatePayload(
  body: Record<string, unknown>,
): { ok: true; fields: SchoolUpdateFields } | { ok: false; errors: string[] } {
  const str = (k: string) => String(body[k] ?? "").trim();
  const school = str("school");
  const title = str("title");
  const session = str("session") || "2025/2026";
  const category = str("category") || "Admissions";
  const summary = str("summary");
  const appliesTo = str("appliesTo") || "All students";
  const sourceName = str("sourceName");
  const sourceUrl = str("sourceUrl");
  const image = str("image") || "/images/cat-school-updates.svg";
  const imageCredit = str("imageCredit") || "Official institution artwork · via Edusphere Africa";
  const dates = toDates(body.dates);
  const requirements = toLines(body.requirements);
  const steps = toLines(body.steps);

  const errors: string[] = [];
  if (!school) errors.push("school/institution name");
  if (!title) errors.push("title");
  if (!summary) errors.push("summary");
  if (!appliesTo) errors.push("who this applies to");
  if (!sourceName) errors.push("source name");
  if (!/^https?:\/\//.test(sourceUrl)) errors.push("valid official source link");
  if (!dates.length) errors.push("at least one key date, as “Label: date”");
  if (
    image.length > MAX_IMAGE_CHARS ||
    !(image.startsWith("/") || /^https?:\/\//.test(image) || image.startsWith("data:image/"))
  ) {
    errors.push("a valid image (upload a photo under ~3MB, or use an image path/URL)");
  }

  if (errors.length) return { ok: false, errors };
  return {
    ok: true,
    fields: {
      school,
      title,
      session,
      category,
      summary,
      appliesTo,
      dates,
      requirements,
      steps,
      sourceName,
      sourceUrl,
      image,
      imageCredit,
    },
  };
}
