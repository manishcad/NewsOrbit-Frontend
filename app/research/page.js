// frontend/app/research/page.js
'use client';

import { useState } from 'react';
import CoverageChart from '../../components/charts/CoverageChart';
import { submitAIQuery } from '../../lib/api';

const CURATED_QUESTIONS = [
  'What are the major technology developments in AI in the database?',
  'Summarize the latest developments in business and markets.',
  'Compare how BBC and Indian news outlets report major events.',
  'What are the recent global health and WHO announcements?',
  'What are the major scientific and environmental discoveries?',
];

export default function AIResearchPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async (targetQuery) => {
    const q = (targetQuery || query).trim();
    if (!q) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await submitAIQuery(q, 12);
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(err.message || 'Failed to analyze query with Gemini.');
    } finally {
      setLoading(false);
    }
  };

  const handleChipClick = (question) => {
    setQuery(question);
    handleSearch(question);
  };

  return (
    <div className="container ai-research-container">
      {/* Editorial AI Hero Header */}
      <div className="ai-research-hero">
        <span className="ai-hero-badge">✦ Grounded Intelligence Engine</span>
        <h1 className="ai-hero-title">AI News Research & Cross-Wire Analysis</h1>
        <p className="ai-hero-subtitle">
          Query the entire collected news database with multi-perspective synthesis.
          Every conclusion is grounded strictly in indexed articles with transparent source citations.
        </p>
      </div>

      {/* AI Query Console */}
      <div className="ai-console-card">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="ai-input-form"
        >
          <textarea
            className="ai-query-textarea"
            placeholder="Pose a journalistic research inquiry (e.g. 'Synthesize tech updates and AI investments', 'Compare reporting across regional & international desks')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={2}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="ai-ask-button"
          >
            <span>✦</span>
            <span>{loading ? 'Synthesizing...' : 'Run Query'}</span>
          </button>
        </form>

        <div className="ai-suggested-wrap">
          <span className="ai-suggested-label">Suggested Inquiries</span>
          <div className="ai-chips-list">
            {CURATED_QUESTIONS.map((question, i) => (
              <button
                key={i}
                type="button"
                className="ai-chip"
                onClick={() => handleChipClick(question)}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Thinking / Loading State */}
      {loading && (
        <div className="ai-thinking-card">
          <div className="editorial-spinner"></div>
          <h3 className="thinking-title">Reviewing Indexed Articles & Synthesizing Citations</h3>
          <p className="thinking-desc">
            Retrieving relevant database records across BBC, Reuters, The Hindu, Odisha TV, News18, and Kanak News to generate verified analysis...
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="state-box" style={{ borderColor: 'var(--accent-burgundy)' }}>
          <h3 style={{ color: 'var(--accent-burgundy)' }}>Research Query Notice</h3>
          <p>{error}</p>
        </div>
      )}

      {/* Grounded Dossier Results */}
      {result && (
        <div className="ai-dossier">
          {/* Dossier Top Bar */}
          <div className="dossier-header">
            <div className="dossier-badge">
              <span>✦</span>
              <span>Synthesized Research Dossier</span>
            </div>
            <div className="dossier-counts">
              <span>Grounded in <strong>{result.articles_used_count || 0}</strong> verified wire records</span>
              {result.gemini_model && <span> • Model: {result.gemini_model}</span>}
            </div>
          </div>

          {/* Executive Summary */}
          {result.summary && (
            <div className="dossier-summary-box">
              <h4 className="dossier-section-label">Executive Briefing</h4>
              <div className="dossier-summary-text">
                <p>{result.summary}</p>
              </div>
            </div>
          )}

          {/* Key Takeaways & Findings */}
          {result.key_findings && result.key_findings.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <h4 className="dossier-section-label">Key Findings & Takeaways</h4>
              <div className="findings-grid">
                {result.key_findings.map((finding, idx) => (
                  <div key={idx} className="finding-card">
                    <span style={{ fontWeight: 700, color: 'var(--accent-burgundy)', marginRight: 6 }}>
                      {String(idx + 1).padStart(2, '0')}.
                    </span>
                    {finding}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Perspectives Comparison */}
          {result.perspectives && Object.keys(result.perspectives).length > 0 && (
            <div className="perspectives-block">
              <h4 className="dossier-section-label">Cross-Source Perspective Analysis</h4>
              <div className="perspectives-grid">
                {Object.entries(result.perspectives).map(([src, viewpoint]) => (
                  <div key={src} className="perspective-col">
                    <div className="perspective-source">{src}</div>
                    <div className="perspective-text">{viewpoint}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Chart & Data Visualizations */}
          {result.chart && result.chart.data && result.chart.data.length > 0 && (
            <div style={{ margin: '32px 0' }}>
              <h4 className="dossier-section-label">Distribution & Coverage Analytics</h4>
              <CoverageChart chart={result.chart} />
            </div>
          )}

          {/* Source Citations with Verification Links */}
          {result.articles_used && result.articles_used.length > 0 && (
            <div className="citations-section">
              <h4 className="citations-title">Verified Source Citations ({result.articles_used.length})</h4>
              <div className="citations-list">
                {result.articles_used.map((item, idx) => (
                  <div key={item.id || idx} className="citation-item">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="citation-link"
                    >
                      {item.title}
                    </a>
                    <span className="citation-badge">
                      {item.source_name} ({item.category})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
