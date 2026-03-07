import Navbar from '@/components/Navbar'
import NewsletterForm from '@/components/NewsletterForm'
import MagneticCursor from '@/components/MagneticCursor'
import SmoothScroller from '@/components/SmoothScroller'
import './globals.css'
import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'


const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-spaceGrotesk',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Wafferly — Amazon Price Tracker',
  description: 'Track Amazon product prices effortlessly. Get email alerts the moment prices drop.',
  keywords: ['price tracker', 'amazon deals', 'price alerts', 'price history'],
  authors: [{ name: 'Wafferly' }],
  openGraph: {
    title: 'Wafferly — Amazon Price Tracker',
    description: 'Track Amazon product prices and never overpay again.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body>
        <SmoothScroller>

          {/* Accessibility: jump past nav for keyboard users */}
          <a href="#main-content" className="skip-link">Skip to main content</a>

          {/* Magnetic cursor (dot + ring) */}
          <MagneticCursor />

          {/* ── Site header ── */}
          <header role="banner">
            <Navbar />
          </header>

          {/* ── Page body ── */}
          <main id="main-content" role="main" className="max-w-10xl mx-auto">
            {children}
          </main>

          {/* ── Site footer ── */}
          <footer role="contentinfo" className="footer-section">
            <div className="footer-grid">

              {/* Brand column */}
              <div className="footer-col">
                <a href="/" className="footer-logo">Wafferly<span>.</span></a>
                <p className="footer-tagline">
                  Track Amazon prices effortlessly. We watch the market so you don't have to —
                  and alert you the moment a deal hits.
                </p>

                {/* Newsletter */}
                <NewsletterForm />

                {/* Social links */}
                <nav aria-label="Social media">
                  <ul className="footer-social">
                    <li>
                      <a href="#" aria-label="Twitter" rel="noopener noreferrer" target="_blank">
                        {/* X / Twitter */}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      </a>
                    </li>
                    <li>
                      <a href="#" aria-label="GitHub" rel="noopener noreferrer" target="_blank">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                        </svg>
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>

              {/* Nav columns */}
              <nav className="footer-col" aria-label="Product links">
                <h4>Product</h4>
                <ul>
                  <li><a href="/track">Track a Product</a></li>
                  <li><a href="/dashboard">My Dashboard</a></li>
                  <li><a href="/alerts">Price Alerts</a></li>
                  <li><a href="/history">Price History</a></li>
                </ul>
              </nav>

              <nav className="footer-col" aria-label="Company links">
                <h4>Company</h4>
                <ul>
                  <li><a href="/about">About Us</a></li>
                  <li><a href="/blog">Blog</a></li>
                  <li><a href="/contact">Contact</a></li>
                </ul>
              </nav>

              <nav className="footer-col" aria-label="Support links">
                <h4>Support</h4>
                <ul>
                  <li><a href="/faq">FAQ</a></li>
                  <li><a href="/privacy">Privacy Policy</a></li>
                  <li><a href="/terms">Terms of Service</a></li>
                </ul>
              </nav>

            </div>

            {/* Copyright bar */}
            <div className="footer-bottom">
              <p>
                <small>&copy; {new Date().getFullYear()} Wafferly. All rights reserved.</small>
              </p>
              <ul className="footer-bottom-links" aria-label="Legal links">
                <li><a href="/terms">Terms</a></li>
                <li><a href="/privacy">Privacy</a></li>
              </ul>
            </div>
          </footer>

        </SmoothScroller>
      </body>
    </html>
  )
}