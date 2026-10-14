/**
 * Where the letterbox setup has actually got to, asked of the internet.
 *
 * WHY THIS EXISTS. Setting forwarding up is four things in four different
 * websites, and until this, the only way to know whether any of them had
 * landed was to ask somebody to run a DNS query on your behalf. The owner did
 * exactly that — "done the Cloudflare bit, what now" — and the honest answer
 * turned out to be that half of step 1 had not happened. He should not have
 * had to ask, and the panel should not have needed me to answer.
 *
 * Asked over DNS-over-HTTPS rather than the resolver, deliberately: a
 * serverless function's own resolver may be restricted or cached, and it was
 * in the container where this was written — every lookup came back ENODATA,
 * including for records that plainly exist. A wrong "your DNS is broken" is
 * worse than no answer at all.
 */

const RESOLVERS = [
  'https://cloudflare-dns.com/dns-query',
  'https://dns.google/resolve',
]

/** One lookup, from whichever resolver answers first. */
async function ask(name, type) {
  for (const base of RESOLVERS) {
    try {
      const r = await fetch(`${base}?name=${encodeURIComponent(name)}&type=${type}`, {
        headers: { accept: 'application/dns-json' },
        signal: AbortSignal.timeout(5000),
        cache: 'no-store',
      })
      if (!r.ok) continue
      const d = await r.json()
      return (d.Answer || []).map((a) => String(a.data || '').toLowerCase())
    } catch { /* try the other one */ }
  }
  // Neither answered. Unknown, which is not the same as "no".
  return null
}

const CLOUDFLARE_NS = /\bcloudflare\b/
const CLOUDFLARE_MX = /\bmx\.cloudflare\.net/

/**
 * @returns {Promise<{onCloudflare: boolean|null, mailRouted: boolean|null,
 *                    nameservers: string[]|null, mx: string[]|null}>}
 *   `null` anywhere means the question could not be asked, never "no".
 */
export async function letterboxDns(host) {
  const apex = String(host || '').replace(/^[^.]+\./, '')
  const [ns, mx] = await Promise.all([ask(apex, 'NS'), ask(host, 'MX')])
  return {
    nameservers: ns,
    mx,
    onCloudflare: ns === null ? null : ns.some((v) => CLOUDFLARE_NS.test(v)),
    mailRouted: mx === null ? null : mx.some((v) => CLOUDFLARE_MX.test(v)),
  }
}
