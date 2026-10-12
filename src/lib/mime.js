/**
 * Turn a raw email into the four facts the arrival parser wants.
 *
 * WHY THIS IS HERE AND NOT IN THE WORKER. Cloudflare's Email Worker hands you
 * a raw RFC 822 message and nothing else. The obvious move is to parse it
 * there, with a library, in an environment that cannot be run locally and
 * whose failures are a line in somebody's Cloudflare log. Instead the Worker
 * stays about fifteen lines with no dependencies and posts the raw message
 * here, where the fiddly half lives in the repository, under test, next to the
 * parser that consumes it.
 *
 * Deliberately not a complete MIME implementation. It needs the sender, the
 * recipient, the subject and the readable text of a delivery email — not
 * attachments, not nested signatures, not calendar parts. Anything it cannot
 * read comes back empty, and an arrival that cannot be read is dropped, which
 * is the correct outcome for a thing this product was never sure about.
 */

const DECODERS = {
  'quoted-printable': decodeQuotedPrintable,
  base64: decodeBase64,
}

/**
 * Soft line breaks and =XX escapes. The commonest encoding in real email.
 *
 * The two-step matters. `=C2=A3` is not one character, it is the two BYTES of
 * a UTF-8 pound sign, so turning each escape straight into a character gives
 * the classic mojibake — a price that reads as a pound sign followed by a
 * capital A with a hat. The escapes are resolved to bytes first, then the
 * whole thing is read back as UTF-8.
 */
function decodeQuotedPrintable(s) {
  const bytes = s
    .replace(/=\r?\n/g, '')
    .replace(/=([0-9A-Fa-f]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
  return utf8(bytes)
}

/** Read a string of raw bytes (one char per byte) back as UTF-8. */
function utf8(bytes) {
  try {
    const out = Buffer.from(bytes, 'latin1').toString('utf8')
    // A lone replacement character means it was not UTF-8 after all; the
    // original bytes are then the better guess than a string full of U+FFFD.
    return out.includes('\uFFFD') && !bytes.includes('\uFFFD') ? bytes : out
  } catch { return bytes }
}

function decodeBase64(s) {
  try {
    return Buffer.from(s.replace(/\s+/g, ''), 'base64').toString('utf8')
  } catch { return '' }
}

/**
 * RFC 2047 encoded words: =?UTF-8?B?...?= and =?UTF-8?Q?...?=
 *
 * Every subject line with a pound sign, an em dash or an accented name arrives
 * this way, so skipping it would lose the subject on a good share of real mail
 * — and the subject is where the stage usually is.
 */
function decodeWords(value) {
  return String(value || '').replace(
    /=\?([^?]+)\?([BbQq])\?([^?]*)\?=/g,
    (_, charset, kind, text) => {
      if (/^b$/i.test(kind)) return decodeBase64(text)
      // Q is quoted-printable with one extra rule: _ means a space.
      return decodeQuotedPrintable(text.replace(/_/g, ' '))
    },
  ).replace(/\?=\s+=\?/g, '')
}

/** Headers up to the first blank line, unfolded, lower-cased keys, in order. */
function readHeaders(head) {
  const out = []
  // A header value may continue on following lines indented by space or tab.
  for (const line of head.replace(/\r?\n[ \t]+/g, ' ').split(/\r?\n/)) {
    const at = line.indexOf(':')
    if (at < 1) continue
    out.push([line.slice(0, at).trim().toLowerCase(), line.slice(at + 1).trim()])
  }
  return out
}

const headerValue = (headers, name) =>
  (headers.find(([k]) => k === name) || [])[1] || ''

function splitMessage(raw) {
  const s = String(raw || '')
  const at = s.search(/\r?\n\r?\n/)
  if (at < 0) return { headers: readHeaders(s), body: '' }
  return { headers: readHeaders(s.slice(0, at)), body: s.replace(/^[\s\S]*?\r?\n\r?\n/, '') }
}

/** Strip tags, scripts and entities so an HTML-only email still reads. */
function textFromHtml(html) {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|tr|li|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/[ \t]+/g, ' ')
}

function decodeBody(headers, body) {
  const encoding = headerValue(headers, 'content-transfer-encoding').toLowerCase()
  const decoded = (DECODERS[encoding] || ((x) => x))(body)
  return /text\/html/i.test(headerValue(headers, 'content-type'))
    ? textFromHtml(decoded)
    : decoded
}

/**
 * Walk a message, collecting readable text.
 *
 * Plain text wins over HTML when a message carries both, which nearly every
 * marketing-shaped delivery email does — the plain part is shorter, has no
 * tracking pixels and no CSS, and so gives the arrival parser far less to trip
 * over. Depth is capped because a forwarded email inside a forwarded email
 * inside a signed wrapper is a real shape and an unbounded one.
 */
function collect(headers, body, depth, out) {
  if (depth > 6) return
  const type = headerValue(headers, 'content-type')
  const boundary = type.match(/boundary="?([^";]+)"?/i)?.[1]

  if (!boundary) {
    const text = decodeBody(headers, body)
    if (text.trim()) out.push({ html: /text\/html/i.test(type), text })
    return
  }

  // Split on the boundary; the preamble before the first one is not a part.
  //
  // (?:--) and not (--): a capturing group in a split pattern puts its match
  // into the result array, and `undefined` for every part that did not end at
  // the closing boundary — which then throws on the next line. Caught by
  // scripts/check-mime.mjs on a perfectly ordinary multipart email.
  const parts = body.split(new RegExp(`\r?\n?--${boundary.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:--)?\r?\n?`))
  for (const part of parts.slice(1)) {
    if (!part.trim()) continue
    const inner = splitMessage(part)
    collect(inner.headers, inner.body, depth + 1, out)
  }
}

const MAX = 40000

/**
 * The four facts, from a raw RFC 822 message.
 *
 * `to` prefers Delivered-To / X-Forwarded-To when they are present, because a
 * forwarded email's To: header is whoever it was originally sent to — the
 * household's own address — while the address that matters here is the card's
 * inbox, which only the delivery headers carry.
 */
export function readRawEmail(raw) {
  const { headers, body } = splitMessage(raw)
  if (!headers.length) return null

  const parts = []
  collect(headers, body, 0, parts)
  const plain = parts.filter((p) => !p.html).map((p) => p.text).join('\n')
  const text = (plain.trim() ? plain : parts.map((p) => p.text).join('\n'))
    .replace(/\u00a0/g, ' ')
    .slice(0, MAX)

  const to = headerValue(headers, 'delivered-to')
    || headerValue(headers, 'x-forwarded-to')
    || headerValue(headers, 'to')

  return {
    from: decodeWords(headerValue(headers, 'from')),
    to: decodeWords(to),
    subject: decodeWords(headerValue(headers, 'subject')),
    text,
  }
}
