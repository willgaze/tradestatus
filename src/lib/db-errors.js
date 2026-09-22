/**
 * Turn a database failure into something the person reading it can act on.
 *
 * The three ways a fresh install falls over all produced the same "unavailable"
 * before this existed, which tells the one person who can fix it nothing at all:
 *
 *   no DATABASE_URL   the env var was never set on the host
 *   unreachable       the connection string is wrong, or the database is asleep
 *   tables missing    the string is right but `prisma db push` was never run
 *
 * The reason codes are safe to send to the browser: they name which step is
 * incomplete, never the connection string, the host, or any credential.
 */

export const DB_REASONS = {
  no_database_url: {
    status: 503,
    title: 'No database configured',
    fix: 'Set DATABASE_URL in the hosting environment, then redeploy.',
  },
  db_unreachable: {
    status: 503,
    title: 'Cannot reach the database',
    fix: 'Check DATABASE_URL is the pooled connection string and the database is awake.',
  },
  tables_missing: {
    status: 503,
    title: 'Database has no tables yet',
    fix: 'Run `npx prisma db push` against this database to create them.',
  },
  unavailable: {
    status: 503,
    title: 'Something went wrong',
    fix: 'Try again in a minute.',
  },
}

/** @returns {keyof typeof DB_REASONS} */
export function dbReason(error) {
  if (!process.env.DATABASE_URL) return 'no_database_url'

  const code = error?.code
  if (code === 'P2021' || code === 'P2022') return 'tables_missing'
  if (code === 'P1000' || code === 'P1001' || code === 'P1003') return 'db_unreachable'

  // Prisma raises a plain initialisation error when the URL is malformed, which
  // carries no code — the message is the only signal available.
  const message = String(error?.message || '')
  if (/Can't reach database server|Environment variable not found|invalid port number/i.test(message)) {
    return 'db_unreachable'
  }
  if (/does not exist in the current database/i.test(message)) return 'tables_missing'

  return 'unavailable'
}
