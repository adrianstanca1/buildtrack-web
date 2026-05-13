import type { MetadataRoute } from 'next';

// Next.js auto-generates /robots.txt from this file. Allow indexing of
// the public marketing pages (/, /login, /register) but block the
// authenticated dashboard since search engines would just hit the
// 307 redirect to /login anyway and waste crawl budget.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/login', '/register'],
        disallow: ['/dashboard/', '/api/'],
      },
    ],
  };
}
