// frontend/components/Navbar.js
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTheme } from '../lib/theme';
import { triggerScrape } from '../lib/api';

const DESKS = [
  { label: 'Home', href: '/' },
  { label: 'Latest', href: '/#latest' },
  { label: 'Technology', href: '/?category=technology' },
  { label: 'Business', href: '/?category=business' },
  { label: 'Science', href: '/?category=science' },
  { label: 'Politics', href: '/?category=politics' },
  { label: 'World', href: '/?category=international' },
];

export default function Navbar({ onScraped }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme, mounted } = useTheme();

  const [searchVal, setSearchVal] = useState('');
  const [scraping, setScraping] = useState(false);
  const [scrapeMsg, setScrapeMsg] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const now = new Date();
    setCurrentDate(
      now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    );
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      router.push(`/?search=${encodeURIComponent(searchVal.trim())}#latest`);
      setMobileMenuOpen(false);
    }
  };

  const handleScrapeAll = async () => {
    try {
      setScraping(true);
      setScrapeMsg('Syncing...');
      await triggerScrape('all');
      setScrapeMsg('Queued!');
      setTimeout(() => setScrapeMsg(''), 4000);
      if (onScraped) onScraped();
    } catch (err) {
      setScrapeMsg('Failed');
      setTimeout(() => setScrapeMsg(''), 4000);
    } finally {
      setScraping(false);
    }
  };

  return (
    <header className="navbar-masthead">
      {/* Top Edition & Date Wire */}
      <div className="nav-top-wire">
        <div className="container nav-top-inner">
          <span className="wire-date">{currentDate || 'Daily Dispatch'}</span>
          <div className="wire-status">
            <span className="sync-live-tag">
              <span className="sync-pulse"></span>
              Live Feed Active
            </span>
            <button
              onClick={handleScrapeAll}
              disabled={scraping}
              className="btn-sync-icon"
              title="Sync latest articles across all news providers"
            >
              <span>{scraping ? '⏳' : '🔄'}</span>
              <span>{scrapeMsg || 'Sync Feeds'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Masthead Row */}
      <div className="nav-main">
        <div className="container nav-main-inner">
          <Link href="/" className="brand-editorial">
            <span className="brand-emblem">✦</span>
            <span className="brand-title">NewsOrbit</span>
            <span className="brand-edition">Global Wire</span>
          </Link>

          {/* Desktop Navigation Desks */}
          <nav className="nav-desks">
            {DESKS.map((desk) => {
              const isActive =
                pathname === desk.href ||
                (desk.href === '/' && pathname === '/');
              return (
                <Link
                  key={desk.label}
                  href={desk.href}
                  className={`desk-link ${isActive ? 'active' : ''}`}
                >
                  {desk.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="nav-actions">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="nav-search-input-wrap">
              <span className="nav-search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search wire..."
                className="nav-search-input"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
              />
            </form>

            {/* AI Research Pill */}
            <Link href="/research" className="btn-ai-nav">
              <span>✦</span>
              <span>Ask AI</span>
            </Link>

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="theme-toggle-btn"
              title="Toggle light / dark mode"
              aria-label="Toggle Theme"
            >
              {mounted && theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div className={`mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <form onSubmit={handleSearchSubmit} style={{ marginBottom: 12 }}>
          <input
            type="text"
            placeholder="Search news..."
            className="nav-search-input"
            style={{ width: '100%' }}
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
          />
        </form>
        {DESKS.map((desk) => (
          <Link
            key={desk.label}
            href={desk.href}
            className="desk-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            {desk.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
