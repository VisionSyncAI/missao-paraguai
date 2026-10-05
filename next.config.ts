import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  allowedDevOrigins: ["127.0.0.1"],
  serverExternalPackages: ["@prisma/client", "prisma"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              `script-src 'self' 'unsafe-inline' https:${process.env.NODE_ENV === "production" ? "" : " 'unsafe-eval'"}`,
              "style-src 'self' 'unsafe-inline' https:",
              "font-src 'self' data: https:",
              "img-src 'self' data: blob: https:",
              "media-src 'self' blob:",
              "connect-src 'self' https:",
              "frame-src 'self' https:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
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
