import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { SiteChrome } from "@/components/chrome";
import { databaseMode } from "@/lib/database-status";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Users can still pinch-zoom for accessibility; this just stops phones
  // from defaulting to a desktop-width layout and shrinking it to fit.
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://edusphereafrica.com"),
  title: {
    default: "Edusphere Africa — Scholarships, School Updates, Jobs & Opportunities",
    template: "%s · Edusphere Africa",
  },
  description:
    "Find the opportunities that move you forward. Scholarships, school updates, jobs, internships, fellowships and opportunities for Africans — curated with clear deadlines and official sources.",
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/images/edusphere-mark.png", sizes: "512x512", type: "image/png" },
      { url: "/images/edusphere-mark.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    siteName: "Edusphere Africa",
    title: "Edusphere Africa — Opportunity discovery for African students",
    description:
      "Scholarships, school updates, jobs, internships, fellowships and opportunities for Africans.",
    images: [{ url: "/images/edusphere-mark.png", width: 512, height: 512, alt: "Edusphere Africa" }],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-brand focus:px-4 focus:py-2 focus:text-paper"
        >
          Skip to content
        </a>
        <SiteChrome demoMode={databaseMode() === "demo"}>{children}</SiteChrome>
      </body>
    </html>
  );
}
