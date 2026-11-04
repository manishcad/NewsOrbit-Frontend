// frontend/app/research/page.js
'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import CoverageChart from '../../components/charts/CoverageChart';
import { submitAIQuery } from '../../lib/api';

const CURATED_QUESTIONS = [
  'What are the latest developments in AI?',
  'What happened in the Indian economy this week?',
  'Compare how BBC and Al Jazeera are covering world news.',
  'What are the recent WHO and global health announcements?',
  'Summarize the latest developments regarding Nvidia.',
];

const STATUS_NOTES = {
  partial: 'The collected articles only partly answer this question. See the limitations below.',
  insufficient: "NewsOrbit doesn't have enough coverage to answer this question yet.",
};

function formatDate(value) {
  if (!value) return 'Date unknown';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'Date unknown';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Turn "[1]" markers in AI text into links to the cited article.
 * Only numbers that exist in `citations` become links.
 */
function CitedText({ text, citations }) {
  if (!text) return null;
  const byRef = new Map(citations.map((c) => [c.ref, c]));
  const parts = text.split(/(\[\d{1,3}\])/g);

  return parts.map((part, i) => {
    const match = part.match(/^\[(\d{1,3})\]$/);
    if (!match) return <span key={i}>{part}</span>;
    const cite = byRef.get(Number(match[1]));
    if (!cite) return null;
    return (
      <a
        key={i}
        href={cite.url}
        target="_blank"
        rel="noopener noreferrer"
        className="citation-ref"
        title={`${cite.source_name}: ${cite.title}`}
      >
        [{cite.ref}]
      </a>
    );
  });
}

function Paragraphs({ text, citations, className }) {
  if (!text) return null;
  return text
    .split(/\n\s*\n/)
    .map((para) => para.trim())
    .filter(Boolean)
    .map((para, i) => (
      <p key={i} className={className}>
        <CitedText text={para} citations={citations} />
      </p>
    ));
}

function ResearchWorkspace() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [usage, setUsage] = useState(null); // { limit, remaining } from the API
  const autoRan = useRef(false);
  const outOfQuestions = usage?.remaining === 0;

  const handleSearch = async (targetQuery) => {
    const q = (targetQuery ?? query).trim();
    if (!q) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await submitAIQuery(q, 12);
      if (data.usage) setUsage(data.usage);
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch (err) {
      if (err.status === 429 && err.data?.limit === 'ai_query') {
        setUsage((u) => ({ limit: u?.limit ?? null, remaining: 0 }));
      }
      setError(err.message || 'The research request failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Support links like /research?q=... (e.g. from an article page).
  useEffect(() => {
    const initial = searchParams.get('q');
    if (initial && !autoRan.current) {
      autoRan.current = true;
      setQuery(initial);
      handleSearch(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleChipClick = (question) => {
    setQuery(question);
    handleSearch(question);
  };

  const citations = result?.citations || [];
  const entities = result?.entities || {};
  const entityGroups = [
    ['People', entities.people],
    ['Organizations', entities.organizations],
    ['Locations', entities.locations],
  ].filter(([, list]) => list && list.length > 0);

  return (
    <div className="container ai-research-container">
      {/* Editorial AI Hero Header */}
      <div className="ai-research-hero">
        <span className="ai-hero-badge">✦ Grounded Intelligence Engine</span>
        <h1 className="ai-hero-title">AI News Research & Cross-Wire Analysis</h1>
        <p className="ai-hero-subtitle">
          Ask a question about the news NewsOrbit has collected. Answers use only those
          articles, and every claim links back to its source.
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
            placeholder="Ask a research question, e.g. 'What happened in the Indian economy this week?'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSearch();
              }
            }}
            maxLength={500}
            rows={2}
            aria-label="Research question"
          />
          <button
            type="submit"
            disabled={loading || !query.trim() || outOfQuestions}
            className="ai-ask-button"
          >
            <span>✦</span>
            <span>{loading ? 'Researching...' : 'Run Query'}</span>
          </button>
        </form>

        {usage && usage.remaining !== null && (
          <p className={`ai-usage-note ${outOfQuestions ? 'empty' : ''}`} aria-live="polite">
            {outOfQuestions
              ? "You've used all of today's free AI questions. They reset within 24 hours."
              : `Free AI questions left today: ${usage.remaining}${
                  usage.limit ? ` of ${usage.limit}` : ''
                }. Questions with no matching news don't count.`}
          </p>
        )}

        <div className="ai-suggested-wrap">
          <span className="ai-suggested-label">Suggested Inquiries</span>
          <div className="ai-chips-list">
            {CURATED_QUESTIONS.map((question) => (
              <button
                key={question}
                type="button"
                className="ai-chip"
                onClick={() => handleChipClick(question)}
                disabled={loading || outOfQuestions}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Thinking / Loading State */}
      {loading && (
        <div className="ai-thinking-card" role="status">
          <div className="editorial-spinner"></div>
          <h3 className="thinking-title">Finding relevant articles & writing a sourced answer</h3>
          <p className="thinking-desc">
            Searching the collected news database, then asking the AI to answer using only those articles.
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="state-box" style={{ borderColor: 'var(--accent-burgundy)' }} role="alert">
          <h3 style={{ color: 'var(--accent-burgundy)' }}>
            {outOfQuestions ? 'Daily Limit Reached' : 'Research Query Notice'}
          </h3>
          <p>{error}</p>
        </div>
      )}

      {/* Grounded Dossier Results */}
      {result && (
        <div className="ai-dossier">
          <div className="dossier-header">
            <div className="dossier-badge">
              <span>✦</span>
              <span>Synthesized Research Dossier</span>
            </div>
            <div className="dossier-counts">
              <span>
                Based on <strong>{result.articles_used_count || 0}</strong>{' '}
                {result.articles_used_count === 1 ? 'article' : 'articles'}
              </span>
              {result.model && <span> • Model: {result.model}</span>}
            </div>
          </div>

          {STATUS_NOTES[result.answer_status] && (
            <div className={`ai-status-note ${result.answer_status}`}>
              {STATUS_NOTES[result.answer_status]}
            </div>
          )}

          {/* Executive Summary */}
          {result.summary && (
            <div className="dossier-summary-box">
              <h4 className="dossier-section-label">Executive Briefing</h4>
              <div className="dossier-summary-text">
                <Paragraphs text={result.summary} citations={citations} />
              </div>
            </div>
          )}

          {/* Reported facts */}
          {result.key_findings?.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <h4 className="dossier-section-label">What the Sources Report</h4>
              <div className="findings-grid">
                {result.key_findings.map((finding, idx) => {
                  const text = typeof finding === 'string' ? finding : (finding?.text || '');
                  const sources = Array.isArray(finding?.sources) ? finding.sources : [];
                  return (
                    <div key={idx} className="finding-card">
                      <span className="finding-num">{String(idx + 1).padStart(2, '0')}.</span>
                      <CitedText text={text} citations={citations} />
                      {sources.length > 0 && !/\[\d+\]/.test(text) && (
                        <CitedText
                          text={' ' + sources.map((n) => `[${n}]`).join('')}
                          citations={citations}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AI interpretation, clearly separated from reporting */}
          {result.analysis && (
            <div className="analysis-box">
              <h4 className="dossier-section-label">AI Analysis</h4>
              <p className="analysis-disclaimer">
                Interpretation generated by AI from the articles below. It is not reporting by the publishers.
              </p>
              <Paragraphs text={result.analysis} citations={citations} className="analysis-text" />
            </div>
          )}

          {/* Perspectives Comparison */}
          {result.perspectives?.length > 0 && (
            <div className="perspectives-block">
              <h4 className="dossier-section-label">How Each Publisher Covers It</h4>
              <div className="perspectives-grid">
                {result.perspectives.map((p, idx) => (
                  <div key={`${p.source}-${idx}`} className="perspective-col">
                    <div className="perspective-source">{p.source}</div>
                    <div className="perspective-text">
                      <CitedText text={p.viewpoint} citations={citations} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Entities */}
          {entityGroups.length > 0 && (
            <div className="entities-block">
              <h4 className="dossier-section-label">Mentioned in Coverage</h4>
              {entityGroups.map(([label, list]) => (
                <div key={label} className="entity-row">
                  <span className="entity-label">{label}</span>
                  <div className="entity-chips">
                    {list.map((name) => (
                      <span key={name} className="entity-chip">{name}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Chart built from real article counts */}
          {result.chart?.data?.length > 0 && (
            <div style={{ margin: '32px 0' }}>
              <h4 className="dossier-section-label">Coverage Breakdown</h4>
              <CoverageChart chart={result.chart} />
            </div>
          )}

          {/* Limitations */}
          {result.limitations && (
            <div className="limitations-box">
              <h4 className="dossier-section-label">Limitations</h4>
              <p>
                <CitedText text={result.limitations} citations={citations} />
              </p>
            </div>
          )}

          {/* Source Citations */}
          {citations.length > 0 && (
            <div className="citations-section">
              <h4 className="citations-title">Sources ({citations.length})</h4>
              <ol className="citations-list">
                {citations.map((item) => (
                  <li key={item.ref} className="citation-item">
                    <span className="citation-num">[{item.ref}]</span>
                    <div className="citation-body">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="citation-link"
                      >
                        {item.title}
                      </a>
                      <span className="citation-badge">
                        {item.source_name} • {formatDate(item.published_at)} •{' '}
                        <Link href={`/article/${item.id}`}>View in NewsOrbit</Link>
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AIResearchPage() {
  return (
    <Suspense fallback={<div className="container"><div className="state-box">Loading research workspace...</div></div>}>
      <ResearchWorkspace />
    </Suspense>
  );
}
