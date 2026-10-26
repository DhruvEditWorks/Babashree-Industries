import type { NextConfig } from 'next';
const dev=process.env.NODE_ENV!=='production';
const csp=["default-src 'self'","img-src 'self' https: data:","font-src 'self' data:","style-src 'self' 'unsafe-inline'",`script-src 'self' 'unsafe-inline'${dev?" 'unsafe-eval'":""}`,"connect-src 'self' https: wss:","frame-src https://www.google.com https://maps.google.com https://*.google.com","object-src 'none'","base-uri 'self'","form-action 'self'","frame-ancestors 'self'"].join('; ');
const nextConfig: NextConfig = {
  poweredByHeader: false,
  allowedDevOrigins: ['*.e2b.app'],
  images: { remotePatterns: [{ protocol: 'https', hostname: '**.supabase.co' }, { protocol: 'https', hostname: 'images.unsplash.com' }] },
  async headers() { return [{ source: '/(.*)', headers: [
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    { key: 'Content-Security-Policy', value: csp }
  ] }]; }
};
export default nextConfig;
