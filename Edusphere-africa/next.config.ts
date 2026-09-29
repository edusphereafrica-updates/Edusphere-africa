import type { NextConfig } from "next";

const photoAssetNames = [
  "hero-campus",
  "cat-scholarships",
  "cat-school",
  "cat-jobs",
  "cat-abroad",
  "cat-fellowships",
  "community",
  "about-desk",
] as const;

const nextConfig: NextConfig = {
  // Backward-compatible mapping for JPEG paths already stored in the database.
  // New builds serve the equivalent self-contained SVG photo artwork.
  async redirects() {
    return photoAssetNames.flatMap((name) =>
      ["jpg", "jpeg", "webp"].map((extension) => ({
        source: `/images/${name}.${extension}`,
        destination: `/images/${name}.svg`,
        permanent: true,
      })),
    );
  },
};

export default nextConfig;
