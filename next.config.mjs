/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        // Baseline security headers for the whole app shell.
        // NOTE: We deliberately do NOT set a global X-Frame-Options here.
        // The module embed route (/embed/[id]) must be framable by our own
        // module pages, so it sets its own SAMEORIGIN + frame-ancestors 'self'
        // policy in its handler. App pages get clickjacking protection via
        // the CSP frame-ancestors directive set in middleware.
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
