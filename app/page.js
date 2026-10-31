// frontend/app/page.js
'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import HeroSection from '../components/HeroSection';
import TrendingSection from '../components/TrendingSection';
import NewsCard from '../components/NewsCard';
import CategoryNav from '../components/CategoryNav';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import { getArticles, getSources, getStats } from '../lib/api';

function DashboardContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialSearch = searchParams.get('search') || '';

  const [articles, setArticles] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState(initialCategory);
  const [source, setSource] = useState('');
  const [search, setSearch] = useState(initialSearch);
  const [sourcesList, setSourcesList] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Sync category or search when URL changes
  useEffect(() => {
    const cat = searchParams.get('category') || '';
    const q = searchParams.get('search') || '';
    setCategory(cat);
    setSearch(q);
    setPage(1);
  }, [searchParams]);

  // Load Metadata (Sources & Stats)
  useEffect(() => {
    async function loadMeta() {
      try {
        const [statsData, sourcesData] = await Promise.all([
          getStats().catch(() => null),
          getSources().catch(() => []),
        ]);
        if (statsData) setStats(statsData);
        if (sourcesData) setSourcesList(sourcesData);
      } catch (e) {
        console.error('Metadata error:', e);
      }
    }
    loadMeta();
  }, []);

  // Load articles
  const loadArticles = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getArticles({
        page,
        category,
        source,
        search,
      });
      setArticles(data.results || []);
      setTotalCount(data.count || 0);
    } catch (err) {
      setError('Could not load articles. Ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  }, [page, category, source, search]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    setPage(1);
  };

  const handleSourceChange = (newSrc) => {
    setSource(newSrc);
    setPage(1);
  };

  // Divide articles for editorial layout when on page 1 with no strict filter
  const isDefaultView = page === 1 && !category && !source && !search;
  const leadArticle = isDefaultView && articles.length > 0 ? articles[0] : null;
  const secondaryArticles = isDefaultView && articles.length > 4 ? articles.slice(1, 4) : [];
  const trendingArticles = isDefaultView && articles.length > 8 ? articles.slice(4, 8) : articles.slice(0, 4);
  const gridArticles = isDefaultView ? articles.slice(4) : articles;

  return (
    <div className="container">
      {/* Editorial Hero (Displayed on homepage front) */}
      {isDefaultView && leadArticle && (
        <HeroSection
          featuredArticle={leadArticle}
          secondaryArticles={secondaryArticles}
        />
      )}

      {/* Trending Stories Strip */}
      {trendingArticles.length > 0 && (
        <TrendingSection articles={trendingArticles} />
      )}

      {/* Desks & Filtering Bar */}
      <section id="latest" className="filters-bar">
        <CategoryNav
          currentCategory={category}
          onSelectCategory={handleCategoryChange}
        />
        <SearchBar
          search={search}
          onSearchChange={setSearch}
          source={source}
          onSourceChange={handleSourceChange}
          sources={sourcesList}
        />
      </section>

      {/* Main News Grid */}
      {loading ? (
        <div className="state-box">
          <div className="editorial-spinner" style={{ margin: '0 auto 16px' }}></div>
          <p>Curating verified stories from the wire...</p>
        </div>
      ) : error ? (
        <div className="state-box">
          <p style={{ color: 'var(--accent-burgundy)' }}>{error}</p>
          <button onClick={loadArticles} className="page-btn" style={{ marginTop: 14 }}>
            Retry
          </button>
        </div>
      ) : gridArticles.length === 0 ? (
        <div className="state-box">
          <h3>No Articles Found</h3>
          <p>Try adjusting your search keywords, clearing filters, or syncing news feeds.</p>
        </div>
      ) : (
        <>
          <div className="section-title-wrap">
            <h2 className="section-heading">
              {category ? `${category.toUpperCase()} Wire` : 'Latest Publications'}
            </h2>
            <span className="edition-meta-counts">
              Showing {gridArticles.length} of {totalCount} records
            </span>
          </div>

          <div className="news-grid">
            {gridArticles.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>

          <Pagination
            page={page}
            totalCount={totalCount}
            pageSize={20}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="container"><div className="state-box">Loading NewsOrbit...</div></div>}>
      <DashboardContent />
    </Suspense>
  );
}
