import './globals.css'

export const metadata = {
  title: 'My Trade Status',
  description: 'See where your job is — booked in, on my way, on site, done.',
  robots: { index: false, follow: false },
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
