// frontend/components/TrendingSection.js
import Link from 'next/link';

export default function TrendingSection({ articles = [] }) {
  if (!articles || articles.length === 0) return null;

  return (
    <section id="trending" className="trending-wire-section">
      <div className="trending-header">
        <h3 className="trending-title">
          <span>🔥</span>
          Trending Stories & Highlights
        </h3>
        <span className="editorial-tag">Top Circulated</span>
      </div>

      <div className="trending-grid">
        {articles.slice(0, 4).map((story, index) => {
          const published = story.published_at
            ? new Date(story.published_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })
            : 'Today';

          return (
            <div key={story.id || index} className="trending-card">
              <span className="trending-number">{String(index + 1).padStart(2, '0')}</span>
              <div className="trending-content">
                <span className="category-tag" style={{ fontSize: '0.65rem' }}>
                  {story.category}
                </span>
                <h4 className="trending-item-title">
                  <Link href={`/article/${story.id}`}>
                    {story.title}
                  </Link>
                </h4>
                <div className="trending-meta">
                  <span>{story.source_name}</span> • <span>{published}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

