import './globals.css'

export const metadata = {
  title: 'My Trade Status',
  description: 'See where your job is — booked in, on my way, on site, done.',
  robots: { index: false, follow: false },
  // Installable, so the trade's side lives on a home screen and opens without
  // browser chrome. The customer never installs anything: they open a link.
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Job Status' },
  icons: { icon: '/icon-192.png', apple: '/icon-192.png' },
}

export const viewport = {
  themeColor: '#255a95',
  // A tap on a control must not zoom the page, but pinch-zoom stays available —
  // never take that away from someone reading an address in bad light.
  width: 'device-width',
  initialScale: 1,
}

// No site header, no marketing nav, no footer. A customer opening this has one
// question and is usually standing in a hallway with the water off.
export default function RootLayout({ children }) {
  return (
    <html lang="en-GB">
      <body className="min-h-screen antialiased text-slate-900">{children}</body>
    </html>
  )
}
