// frontend/app/layout.js
import { Suspense } from "react";
import Link from 'next/link';
import './globals.css';
import { ThemeProvider } from '../lib/theme';
import Navbar from '../components/Navbar';

export const metadata = {
  title: 'NewsOrbit — The Daily Dispatch & AI Research Lab',
  description: 'An editorial news platform with grounded AI research, multi-source citations, and interactive analytics.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;0,6..72,700;1,6..72,400;1,6..72,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider>
          <div className="site-wrapper">
            <Suspense fallback={<div className="navbar-loading" />}>
              <Navbar />
            </Suspense>
            <main className="main-content">{children}</main>
            <footer className="site-footer">
              <div className="container footer-inner">
                <div className="footer-brand">
                  <div className="brand-logo-text">
                    <span className="logo-emblem">✦</span>
                    <span className="logo-title">NewsOrbit</span>
                  </div>
                  <p className="footer-tagline">
                    Independent aggregated reporting powered by verification and generative intelligence.
                  </p>
                </div>
                <div className="footer-links">
                  <div className="footer-col">
                    <h4>Desks</h4>
                    <Link href="/?category=national">National</Link>
                    <Link href="/?category=international">World</Link>
                    <Link href="/?category=business">Business</Link>
                    <Link href="/?category=technology">Technology</Link>
                    <Link href="/?category=sports">Sports</Link>
                  </div>
                  <div className="footer-col">
                    <h4>Platform</h4>
                    <Link href="/research">AI Research Lab</Link>
                    <Link href="/#trending">Trending Stories</Link>
                    <Link href="/#latest">Latest Wire</Link>
                  </div>
                </div>
              </div>
              <div className="footer-bottom container">
                <span>© 2026 NewsOrbit Global News & Research Syndicate.</span>
                <span>Crafted for deep journalistic exploration and grounded AI inquiry.</span>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
