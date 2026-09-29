import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto w-full max-w-[76rem] px-5 py-24 md:px-8 md:py-32">
      <div className="max-w-xl">
        <span className="label">404 — page not found</span>
        <h1 className="mt-5 text-[clamp(2rem,7vw,3.5rem)] leading-[1.03] text-ink">
          This opportunity may have closed — or never existed.
        </h1>
        <p className="mt-5 text-[1rem] leading-relaxed text-muted">
          The link you followed doesn&apos;t lead to a listing on Edusphere Africa. Try searching, or
          browse what is open right now.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/search" className="inline-flex min-h-[3.25rem] items-center bg-brand px-6 text-[0.9375rem] font-semibold text-paper transition-colors hover:bg-brand-dark">
            Search the site
          </Link>
          <Link href="/scholarships" className="inline-flex min-h-[3.25rem] items-center border border-rule-strong bg-card px-6 text-[0.9375rem] font-semibold text-ink transition-colors hover:border-ink">
            Browse scholarships
          </Link>
        </div>
      </div>
    </section>
  );
}
