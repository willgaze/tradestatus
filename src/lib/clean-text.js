// Free-text fields arrive from a JSON body, so they are whatever the caller
// sent — a number, an object, null. `body.customerName?.trim()` throws a
// TypeError on any of those, and the route's catch block then hands it to
// dbReason(), which reports a *database* fault for what was really a bad
// request. That sends whoever is debugging to the Neon console over a typo in
// a fetch call.
//
// So: coerce here, never trust the shape, and cap the length. Nothing on this
// form is long, and an unbounded TEXT column plus a stray paste is how a row
// ends up holding a megabyte of someone's clipboard.
export const FIELD_MAX = 500

export function cleanText(value, max = FIELD_MAX) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed
}
