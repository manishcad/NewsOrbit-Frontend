// frontend/components/HeroSection.js
import Link from 'next/link';

export default function HeroSection({ featuredArticle, secondaryArticles = [] }) {
  if (!featuredArticle) return null;

  const publishedDate = featuredArticle.published_at
    ? new Date(featuredArticle.published_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recent Publication';

  const heroImgUrl = featuredArticle.image_url || (featuredArticle.extra && featuredArticle.extra.image_url);

  return (
    <section className="editorial-hero-section">
      <div className="editorial-header-banner">
        <span className="edition-headline-label">Featured Story & Editorial Selection</span>
        <span className="edition-meta-counts">Updated Continuously</span>
      </div>

      <div className="hero-grid">
        {/* Main Lead Story */}
        <div className="hero-lead-card">
          <div className="hero-image-wrap">
            {heroImgUrl ? (
              <img
                src={heroImgUrl}
                alt={featuredArticle.title}
                className="hero-image"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="card-image-placeholder" style={{ fontSize: '3rem' }}>
                <span>📰</span>
              </div>
            )}
          </div>

          <div className="hero-meta-row">
            <span className="source-badge">{featuredArticle.source_name}</span>
            <span className="category-tag">{featuredArticle.category}</span>
            <span>•</span>
            <span style={{ color: 'var(--text-muted)' }}>{publishedDate}</span>
          </div>

          <h1 className="hero-title">
            <Link href={`/article/${featuredArticle.id}`}>
              {featuredArticle.title}
            </Link>
          </h1>

          <p className="hero-summary">
            {featuredArticle.summary ||
              'Read the full investigative coverage and detailed reports curated from leading regional and national sources.'}
          </p>

          <div className="hero-footer-bar">
            <span>By {featuredArticle.author || featuredArticle.source_name}</span>
            <Link
              href={`/article/${featuredArticle.id}`}
              className="editorial-tag"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              Read Full Coverage →
            </Link>
          </div>
        </div>

        {/* Secondary Stories Column */}
        <div className="hero-sidebar">
          <h3 className="sidebar-heading">Wire Dispatch & Insights</h3>

          {secondaryArticles.slice(0, 3).map((article) => {
            const dateStr = article.published_at
              ? new Date(article.published_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })
              : 'Recent';

            return (
              <div key={article.id} className="side-story-card">
                <span className="category-tag" style={{ fontSize: '0.68rem' }}>
                  {article.category}
                </span>
                <h4 className="side-story-title">
                  <Link href={`/article/${article.id}`}>
                    {article.title}
                  </Link>
                </h4>
                <div className="side-story-meta">
                  <span>{article.source_name}</span> • <span>{dateStr}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

