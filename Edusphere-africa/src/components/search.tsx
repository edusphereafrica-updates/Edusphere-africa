"use client";

import { useRouter } from "next/navigation";
import { Search as SearchIcon } from "lucide-react";
import { useState, type FormEvent } from "react";

export function SearchField({
  large = false,
  defaultValue = "",
  autoFocus = false,
  id = "q",
}: {
  large?: boolean;
  defaultValue?: string;
  autoFocus?: boolean;
  id?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);

  function submit(e: FormEvent) {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  }

  return (
    <form
      onSubmit={submit}
      role="search"
      className={`group flex w-full items-center gap-3 bg-card transition-all duration-300 ${
        large
          ? "border border-rule-strong px-4 focus-within:border-brand focus-within:shadow-[0_18px_40px_-30px_rgba(28,33,25,.7)] md:px-5"
          : "border border-rule px-3.5 focus-within:border-brand"
      }`}
    >
      <SearchIcon
        className={large ? "h-5 w-5 shrink-0 text-brand" : "h-4 w-4 shrink-0 text-muted"}
        strokeWidth={2}
        aria-hidden="true"
      />
      <input
        id={id}
        type="search"
        name="q"
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search scholarships, schools, jobs or opportunities"
        aria-label="Search scholarships, schools, jobs or opportunities"
        className={`w-full min-w-0 bg-transparent text-ink placeholder:text-muted/70 focus:outline-none ${
          large ? "h-[3.75rem] text-[0.9375rem] md:text-[1.0625rem]" : "h-11 text-[0.875rem]"
        }`}
      />
      <button
        type="submit"
        aria-label="Search"
        className={`grid shrink-0 place-items-center bg-brand text-paper transition-colors hover:bg-brand-dark ${
          large ? "h-11 w-11 md:h-12 md:w-12" : "h-8 w-8"
        }`}
      >
        <SearchIcon className={large ? "h-5 w-5" : "h-4 w-4"} strokeWidth={2.4} />
      </button>
    </form>
  );
}
