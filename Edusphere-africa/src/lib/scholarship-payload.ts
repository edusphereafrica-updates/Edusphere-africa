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

const MAX_IMAGE_CHARS = 4_000_000;

export type ScholarshipFields = {
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

export function parseScholarshipPayload(
  body: Record<string, unknown>,
): { ok: true; fields: ScholarshipFields } | { ok: false; errors: string[] } {
  const str = (k: string) => String(body[k] ?? "").trim();
  const title = str("title");
  const provider = str("provider");
  const country = str("country");
  const studyLevel = str("studyLevel") || "Undergraduate";
  const fundingType = str("fundingType") || "Fully funded";
  const applicants = str("applicants") || "International students";
  const summary = str("summary");
  const deadline = str("deadline");
  const applyUrl = str("applyUrl");
  const sourceName = str("sourceName");
  const sourceUrl = str("sourceUrl");
  const image = str("image") || "/images/cat-scholarships.svg";
  const imageCredit = str("imageCredit") || "Official provider artwork · via Edusphere Africa";
  const featured = Boolean(body.featured);
  const benefits = toLines(body.benefits);
  const requirements = toLines(body.requirements);
  const documents = toLines(body.documents);
  const howToApply = toLines(body.howToApply);

  const errors: string[] = [];
  if (!title) errors.push("title");
  if (!provider) errors.push("provider");
  if (!country) errors.push("country");
  if (!summary) errors.push("summary");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(deadline)) errors.push("deadline (YYYY-MM-DD)");
  if (!/^https?:\/\//.test(applyUrl)) errors.push("valid application link");
  if (!sourceName) errors.push("source name");
  if (!/^https?:\/\//.test(sourceUrl)) errors.push("valid official source link");
  if (!benefits.length) errors.push("at least one benefit line");
  if (!requirements.length) errors.push("at least one eligibility/requirement line");
  if (!documents.length) errors.push("at least one required-document line");
  if (!howToApply.length) errors.push("at least one how-to-apply step");
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
      provider,
      country,
      studyLevel,
      fundingType,
      applicants,
      summary,
      deadline,
      benefits,
      requirements,
      documents,
      howToApply,
      applyUrl,
      sourceName,
      sourceUrl,
      image,
      imageCredit,
      featured,
    },
  };
}
