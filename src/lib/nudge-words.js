import { zoned } from '@/lib/when'

/**
 * "tomorrow", "today", or "on Thursday", counted in calendar days in the
 * trade's zone — so a job at 09:00 is "tomorrow" at 23:00 the night before,
 * not "in ten hours". Shared by the server (nudge.js) and the customer's
 * page, which is why it lives apart from anything that touches the database.
 */
export function dayWord(start, now = new Date()) {
  const a = zoned(start), b = zoned(now)
  if (!a || !b) return 'soon'
  const days = Math.round((Date.UTC(a.year, a.month - 1, a.day) - Date.UTC(b.year, b.month - 1, b.day)) / 86_400_000)
  if (days <= 0) return 'today'
  if (days === 1) return 'tomorrow'
  return 'on ' + ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][a.weekday]
}
