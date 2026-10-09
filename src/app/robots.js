/**
 * One page is findable and the rest is not.
 *
 * The homepage has to be in a search index or it is not a homepage. Everything
 * else here must never be: `/t/<code>` is a customer's name and home address
 * behind nothing but the code in the URL, `/dashboard` is every customer at
 * once, and a leaked link that reaches a search index is leaked to everybody,
 * permanently, in a way that cannot be taken back by revoking it.
 *
 * Each of those pages also sets `robots: { index: false }` in its own
 * metadata. This file is the second lock on the same door, not a replacement
 * for the first: a crawler that ignores one may honour the other, and a new
 * route added without the meta tag is still covered here.
 */
export default function robots() {
  return {
    rules: [{
      userAgent: '*',
      allow: '/',
      disallow: ['/t/', '/dashboard', '/plan', '/login', '/demo', '/preview', '/api/'],
    }],
  }
}
