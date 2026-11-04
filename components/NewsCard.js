// frontend/components/NewsCard.js
import Link from 'next/link';
import { getArticleImage, DEFAULT_FALLBACK_IMAGE } from '../lib/imageFallback';

export default function NewsCard({ article, compact = false }) {
  const rawDate = article.published_at || article.collected_at;
  const publishedDate = rawDate
    ? new Date(rawDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recent Wire';

  const imageUrl = getArticleImage(article);

  return (
    <article className={`news-card ${compact ? 'compact' : ''}`}>
      <div className="card-image-wrap">
        <img
          src={imageUrl}
          alt={article.title}
          className="card-image"
          loading="lazy"
          onError={(e) => {
            if (e.currentTarget.src !== DEFAULT_FALLBACK_IMAGE) {
              e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
            }
          }}
        />
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
