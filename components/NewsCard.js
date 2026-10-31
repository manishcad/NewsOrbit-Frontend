// frontend/components/NewsCard.js
import Link from 'next/link';

export default function NewsCard({ article, compact = false }) {
  const publishedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recent Wire';

  // Support both article.image_url and extra.image_url
  const imageUrl = article.image_url || (article.extra && article.extra.image_url);

  return (
    <article className={`news-card ${compact ? 'compact' : ''}`}>
      <div className="card-image-wrap">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={article.title}
            className="card-image"
            loading="lazy"
            onError={(e) => {
              // Graceful fallback if external image URL is blocked/broken
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.parentElement) {
                e.currentTarget.parentElement.classList.add('has-fallback');
              }
            }}
          />
        ) : (
          <div className="card-image-placeholder">
            <span>📰</span>
          </div>
        )}
      </div>

      <div className="card-body">
        <div className="card-meta-top">
          <span className="source-badge">{article.source_name}</span>
          <span className="category-tag">{article.category}</span>
        </div>

        <h2 className="card-title">
          <Link href={`/article/${article.id}`}>
            {article.title}
          </Link>
        </h2>

        {!compact && (
          <p className="card-summary">
            {article.summary
              ? article.summary.slice(0, 160) + (article.summary.length > 160 ? '...' : '')
              : 'Click to explore full article details, context, and original publication records.'}
          </p>
        )}

        <div className="card-footer">
          <span>{publishedDate}</span>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="source-link"
          >
            Source ↗
          </a>
        </div>
      </div>
    </article>
  );
}
