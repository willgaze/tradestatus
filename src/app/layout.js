import './globals.css'
import { theme } from '@/lib/version'
import { PRODUCT_NAME } from '@/lib/product'

export const metadata = {
  title: PRODUCT_NAME,
  description: 'See where your job is — booked in, on my way, on site, done.',
  robots: { index: false, follow: false },
  // Installable, so the trade's side lives on a home screen and opens without
  // browser chrome. The customer never installs anything: they open a link.
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Job Status' },
  icons: { icon: '/icon-192.png', apple: '/icon-192.png' },
}

export const viewport = {
  themeColor: theme().accent,
  // A tap on a control must not zoom the page, but pinch-zoom stays available —
  // never take that away from someone reading an address in bad light.
  width: 'device-width',
  initialScale: 1,
}

// No site header, no marketing nav, no footer. A customer opening this has one
// question and is usually standing in a hallway with the water off.
export default function RootLayout({ children }) {
  const t = theme()
  return (
    <html lang="en-GB"
          style={{ '--theme-bg': t.bg, '--theme-bg-dark': t.bgDark, '--mts-accent': t.accent, '--mts-deep': t.deep }}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  )
}
