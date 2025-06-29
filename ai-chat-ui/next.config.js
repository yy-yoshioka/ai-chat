/* eslint-disable @typescript-eslint/no-require-imports */
const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [require('remark-gfm')],
    rehypePlugins: [require('rehype-highlight')],
    // If you use `MDXProvider`, uncomment the following line.
    // providerImportSource: "@mdx-js/react",
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  
  // Enable standalone output for Docker
  output: 'standalone',
  
  // Disable ESLint during production build
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },

  // Legacy admin route redirects (301 permanent redirects)
  async redirects() {
    return [
      // Legacy top-level routes (v2 refactor)
      {
        source: '/chat',
        destination: '/admin/default/chats',
        permanent: true,
      },
      {
        source: '/widgets',
        destination: '/admin/default/settings/widgets',
        permanent: true,
      },

      // Legacy admin dashboard routes
      {
        source: '/admin/dashboard',
        destination: '/admin/default/dashboard',
        permanent: true,
      },
      {
        source: '/admin/chats',
        destination: '/admin/default/chats',
        permanent: true,
      },
      {
        source: '/admin/logs',
        destination: '/admin/default/logs',
        permanent: true,
      },
      {
        source: '/admin/users',
        destination: '/admin/default/users',
        permanent: true,
      },
      {
        source: '/admin/reports',
        destination: '/admin/default/reports',
        permanent: true,
      },
      {
        source: '/admin/settings',
        destination: '/admin/default/settings',
        permanent: true,
      },

      // Legacy FAQ routes
      {
        source: '/admin/faq',
        destination: '/admin/default/faq',
        permanent: true,
      },
      {
        source: '/admin/faq/create',
        destination: '/admin/default/faq/create',
        permanent: true,
      },
      {
        source: '/admin/faq/:id',
        destination: '/admin/default/faq/:id',
        permanent: true,
      },

      // Legacy org-specific routes
      {
        source: '/admin/org/:orgId',
        destination: '/admin/:orgId/dashboard',
        permanent: true,
      },
      {
        source: '/admin/org/:orgId/billing-plans',
        destination: '/admin/:orgId/billing-plans',
        permanent: true,
      },
      {
        source: '/admin/org/:orgId/:path*',
        destination: '/admin/:orgId/:path*',
        permanent: true,
      },

      // Handle root admin redirect
      {
        source: '/admin',
        destination: '/admin/default/dashboard',
        permanent: false, // Use 302 for dynamic redirects
      },
    ];
  },

  // Enable MDX support
  ...withMDX(),
};

module.exports = nextConfig;
