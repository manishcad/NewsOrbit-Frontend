
import Link from 'next/link';
import { Suspense } from 'react';
import { getArticleImage, DEFAULT_FALLBACK_IMAGE } from '../../../lib/imageFallback';

async function fetchArticle(id) {
  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

  try {
    const res = await fetch(
      `${API_BASE}/news/articles/${id}/`,
      { cache: 'no-store' }
    );

    if (!res.ok) return null;

    return await res.json();
  } catch (e) {
    console.error('Failed to fetch article:', e);
    return null;
  }
}

// Main page: provides the Suspense boundary
export default function ArticleDetailPage({ params }) {
  return (
    <Suspense
      fallback={
        <div className="container" style={{ padding: '40px 0' }}>
          <div className="state-box">
            <h2>Loading Article...</h2>
            <p>Please wait while we retrieve the news story.</p>
          </div>
        </div>
      }
    >
      <ArticleContent params={params} />
    </Suspense>
  );
}

// Fetch article inside the Suspense boundary
async function ArticleContent({ params }) {
  const { id } = await params;
  const article = await fetchArticle(id);

  if (!article) {
    return (
      <div className="container" style={{ padding: '40px 0' }}>
        <div className="state-box">
          <h2>Article Not Found</h2>
          <p>
            The requested news wire story could not be retrieved
            from the database.
          </p>

          <Link
            href="/"
            className="page-btn"
            style={{ display: 'inline-block', marginTop: 16 }}
          >
            ← Back to News Wire
          </Link>
        </div>
      </div>
    );
  }

  const rawDate = article.published_at || article.collected_at;
  const published = rawDate
    ? new Date(rawDate).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
    : 'Recent Publication';

  const imageUrl = getArticleImage(article);

  return (
    <div className="container">
      <article className="reader-container">
        <Link href="/" className="back-link">
          ← Return to Wire Dashboard
        </Link>

        <header className="reader-header">
          <div className="card-meta-top" style={{ marginBottom: 12 }}>
            <span className="source-badge">
              {article.source_name}
            </span>
            <span className="category-tag">
              {article.category}
            </span>
          </div>

          <h1 className="reader-title">{article.title}</h1>

          <div className="reader-byline">
            <span>
              By {article.author || `${article.source_name} Bureau`}
            </span>
            <span>{published}</span>
          </div>
        </header>

        {imageUrl && (
          <div
            style={{
              marginBottom: 30,
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
            }}
          >
            <img
              src={imageUrl}
              alt={article.title}
              style={{
                width: '100%',
                maxHeight: 440,
                objectFit: 'cover',
              }}
            />
          </div>
        )}

        <div className="reader-body">
          {article.content ? (
            article.content
              .split('\n\n')
              .map((para, i) => <p key={i}>{para}</p>)
          ) : article.summary ? (
            <p>{article.summary}</p>
          ) : (
            <p>
              Full wire dispatch text not stored. Please refer to
              original source below.
            </p>
          )}
        </div>

        <div
          style={{
            marginTop: 40,
            paddingTop: 20,
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Link
            href={`/research?q=${encodeURIComponent(`What is the latest on: ${article.title}`)}`}
            className="btn-ai-nav"
          >
            ✦ Query AI Research on this topic
          </Link>

          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="source-link"
            style={{ fontSize: '0.9rem' }}
          >
            Visit Original Source Publication ↗
          </a>
        </div>
      </article>
    </div>
  );
}
