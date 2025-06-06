import type { NextConfig } from "next";
import withSerwistInit from '@serwist/next';

const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts', // service worker source file
  swDest: 'public/sw.js', // service worker destination file
  disable: process.env.NODE_ENV !== 'production', // disable in development
  injectionPoint: '__SW_MANIFEST', // injection point for precache entries
  globPublicPatterns: [
    '**/*.{js,css,html,png,jpg,jpeg,svg,webp,woff2,ttf,json}', // files to cache
    'offline.html',
  ],
});

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSerwist(nextConfig);
