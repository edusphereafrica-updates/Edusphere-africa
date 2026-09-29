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

// A generous ceiling on the stored image: about 4MB of base64 text, which
// covers a multi-megabyte source photo while staying well under Vercel's
// request-body limit for the rest of the form fields.
const MAX_IMAGE_CHARS = 4_000_000;

export type OpportunityFields = {
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

/**
 * Parses and validates a create/edit request body. Returns either the clean
 * fields ready to insert/update, or a list of human-readable problems.
 */
export function parseOpportunityPayload(
  body: Record<string, unknown>,
): { ok: true; fields: OpportunityFields } | { ok: false; errors: string[] } {
  const str = (k: string) => String(body[k] ?? "").trim();
  const title = str("title");
  const organization = str("organization");
  const oppType = str("oppType") || "Fellowship";
  const region = str("region");
  const summary = str("summary");
  const deadline = str("deadline");
  const applyUrl = str("applyUrl");
  const sourceName = str("sourceName");
  const sourceUrl = str("sourceUrl");
  const image = str("image") || "/images/cat-fellowships.svg";
  const imageCredit = str("imageCredit") || "Official provider artwork · via Edusphere Africa";
  const eligibility = toLines(body.eligibility);
  const benefits = toLines(body.benefits);
  const process = toLines(body.process);

  const errors: string[] = [];
  if (!title) errors.push("title");
  if (!organization) errors.push("organization");
  if (!region) errors.push("region");
  if (!summary) errors.push("summary");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(deadline)) errors.push("deadline (YYYY-MM-DD)");
  if (!/^https?:\/\//.test(applyUrl)) errors.push("valid application link");
  if (!sourceName) errors.push("source name");
  if (!/^https?:\/\//.test(sourceUrl)) errors.push("valid official source link");
  if (!eligibility.length) errors.push("at least one eligibility line");
  if (!benefits.length) errors.push("at least one benefit line");
  if (!process.length) errors.push("at least one application-process line");
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
      title,
      organization,
      oppType,
      region,
      summary,
      deadline,
      applyUrl,
      sourceName,
      sourceUrl,
      image,
      imageCredit,
      eligibility,
      benefits,
      process,
    },
  };
}
