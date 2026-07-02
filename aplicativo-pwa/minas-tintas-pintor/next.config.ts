import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  // Dev via IP da rede local (celular): sem isso o Next 16 bloqueia os
  // assets /_next/* pra origens fora de localhost e o app não hidrata.
  allowedDevOrigins: ["192.168.1.*"],
  turbopack: {
    root: __dirname,
  },
};

export default withSerwist(nextConfig);
