import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  allowedDevOrigins: ["127.0.0.1"],
  serverExternalPackages: ["@prisma/client", "prisma"],
  async redirects() {
    // missaoparaguai.com is the canonical domain; www only forwards to it.
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.missaoparaguai.com" }],
        destination: "https://missaoparaguai.com/:path*",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    // The public site is static HTML. Serving it as the top-level document (not inside an
    // iframe) lets iOS Safari collapse its toolbars and keeps the URL, scroll and SEO native.
    return {
      beforeFiles: [{ source: "/", destination: "/site.html" }],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
