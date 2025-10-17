import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
    experimental: {
        serverActions: { bodySizeLimit: "5mb" },
    },
    async rewrites() {
        // In production, forward /uploads/* to /data/uploads/*
        return isProd
            ? [
                  {
                      source: "/uploads/:path*",
                      destination: "/data/uploads/:path*", // map URLs → file path
                  },
              ]
            : [];
    },
};

export default nextConfig;
