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

/** A single collapsed previous-turn card in the conversation thread. */
function PastTurnCard({ turn, turnNumber, onReask }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="past-turn-card">
      <div className="past-turn-header" onClick={() => setExpanded((v) => !v)}>
        <div className="past-turn-meta">
          <span className="past-turn-num">{turnNumber}</span>
          <span className="past-turn-query">{turn.query}</span>
        </div>
        <div className="past-turn-actions">
          <button
            type="button"
            className="past-turn-btn"
            onClick={(e) => {
              e.stopPropagation();
              onReask(turn.query);
            }}
            title="Ask this again"
          >
            ↺ Re-ask
          </button>
          <span className="past-turn-toggle" aria-hidden="true">
            {expanded ? '▲' : '▼'}
          </span>
        </div>
      </div>
      {expanded && turn.summary && (
        <div className="past-turn-body">
          <Paragraphs text={turn.summary} citations={turn.citations || []} />
        </div>
      )}
    </div>
  );
}

/** The full dossier panel for the most recent answer. */
function DossierPanel({ result }) {
  const citations = result.citations || [];
  const entities = result.entities || {};
  const entityGroups = [
    ['People', entities.people],
    ['Organizations', entities.organizations],
    ['Locations', entities.locations],
  ].filter(([, list]) => list && list.length > 0);

  return (
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

      {/* AI interpretation */}
      {result.analysis && (
        <div className="analysis-box">
          <h4 className="dossier-section-label">AI Analysis</h4>
          <p className="analysis-disclaimer">
            Interpretation generated by AI from the articles below. It is not reporting by the publishers.
          </p>
          <Paragraphs text={result.analysis} citations={citations} className="analysis-text" />
        </div>
      )}

      {/* Perspectives */}
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

      {/* Chart */}
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

      {/* Sources */}
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
  );
}

function ResearchWorkspace() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);
  const [conversation, setConversation] = useState([]); // [ { query, summary, citations } ]
  const [error, setError] = useState('');
  const [usage, setUsage] = useState(null);
  const autoRan = useRef(false);
  const threadBottomRef = useRef(null);
  const outOfQuestions = usage?.remaining === 0;

  // Scroll to bottom of thread whenever conversation grows
  useEffect(() => {
    if (conversation.length > 0 || currentResult) {
      threadBottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [conversation, currentResult]);

  const handleSearch = async (targetQuery) => {
    const q = (targetQuery ?? query).trim();
    if (!q) return;

    setLoading(true);
    setError('');

    // Carry previous result into conversation history before fetching
    setCurrentResult((prevResult) => {
      if (prevResult) {
        setConversation((prev) =>
          [
            ...prev,
            {
              query: prevResult.query || q,
              summary: prevResult.summary || '',
              citations: prevResult.citations || [],
            },
          ].slice(-6)
        );
      }
      return null; // clear current while loading
    });

    try {
      // Build conversation payload (summaries only — the backend expects {query, summary})
      const conversationPayload = conversation.map(({ query: q2, summary }) => ({
        query: q2,
        summary,
      }));

      const data = await submitAIQuery(q, 12, conversationPayload);
      if (data.usage) setUsage(data.usage);
      if (data.error) {
        setError(data.error);
      } else {
        setCurrentResult({ ...data, query: q });
      }
    } catch (err) {
      if (err.status === 429 && err.data?.limit === 'ai_query') {
        setUsage((u) => ({ limit: u?.limit ?? null, remaining: 0 }));
      }
      setError(err.message || 'The research request failed. Please try again.');
      // Restore the previous result if it failed
      setConversation((prev) => {
        const last = prev[prev.length - 1];
        if (last && !currentResult) {
          // remove the last turn we just appended since request failed
          return prev.slice(0, -1);
        }
        return prev;
      });
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

  const handleReask = (q) => {
    setQuery(q);
    handleSearch(q);
  };

  const handleNewSession = () => {
    setConversation([]);
    setCurrentResult(null);
    setError('');
    setQuery('');
  };

  const isFollowUp = conversation.length > 0 || currentResult;

  return (
    <div className="container ai-research-container">
      {/* Hero Header */}
      <div className="ai-research-hero">
        <span className="ai-hero-badge">✦ Grounded Intelligence Engine</span>
        <h1 className="ai-hero-title">AI News Research &amp; Cross-Wire Analysis</h1>
        <p className="ai-hero-subtitle">
          Ask a question about the news NewsOrbit has collected. Answers use only those
          articles, and every claim links back to its source.
        </p>
      </div>

      {/* Query Console */}
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
            placeholder={
              isFollowUp
                ? 'Ask a follow-up — e.g. "Which companies are investing the most?" or "Compare their approaches."'
                : "Ask a research question, e.g. 'What happened in the Indian economy this week?'"
            }
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
            <span>{loading ? 'Researching...' : isFollowUp ? 'Follow Up' : 'Run Query'}</span>
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

        {!isFollowUp && (
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
        )}
      </div>

      {/* Research Session Thread */}
      {(conversation.length > 0 || currentResult || loading) && (
        <div className="research-session">

          {/* Session header with New Session button */}
          {conversation.length > 0 && (
            <div className="session-header">
              <div className="session-header-left">
                <span className="session-label">Research Session</span>
                <span className="session-count">
                  {conversation.length} previous question{conversation.length !== 1 ? 's' : ''}
                </span>
              </div>
              <button
                type="button"
                className="new-session-btn"
                onClick={handleNewSession}
                title="Start a new research session"
              >
                ✕ New Session
              </button>
            </div>
          )}

          {/* Past turns (collapsed by default) */}
          {conversation.map((turn, idx) => (
            <PastTurnCard
              key={`${idx}-${turn.query}`}
              turn={turn}
              turnNumber={idx + 1}
              onReask={handleReask}
            />
          ))}

          {/* Current question label */}
          {(loading || currentResult) && (
            <div className="current-turn-label">
              <span className="current-turn-num">{conversation.length + 1}</span>
              <span className="current-turn-query">
                {loading && !currentResult
                  ? query || '...'
                  : currentResult?.query || query}
              </span>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="ai-thinking-card" role="status">
              <div className="editorial-spinner"></div>
              <h3 className="thinking-title">Finding relevant articles &amp; writing a sourced answer</h3>
              <p className="thinking-desc">
                Searching the collected news database, then asking the AI to answer using only those articles.
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              className="state-box"
              style={{ borderColor: 'var(--accent-burgundy)' }}
              role="alert"
            >
              <h3 style={{ color: 'var(--accent-burgundy)' }}>
                {outOfQuestions ? 'Daily Limit Reached' : 'Research Query Notice'}
              </h3>
              <p>{error}</p>
            </div>
          )}

          {/* Latest dossier */}
          {currentResult && !loading && <DossierPanel result={currentResult} />}

          {/* Follow-up prompt */}
          {currentResult && !loading && (
            <div className="followup-prompt">
              <span className="followup-hint">
                💬 Continue this session — ask a follow-up question above
              </span>
              <div className="followup-chips">
                {[
                  'Who are the key people involved?',
                  'Which sources cover this most?',
                  'What are the opposing views?',
                  'Summarize in one sentence.',
                ].map((q2) => (
                  <button
                    key={q2}
                    type="button"
                    className="ai-chip followup-chip"
                    onClick={() => handleChipClick(q2)}
                    disabled={loading || outOfQuestions}
                  >
                    {q2}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={threadBottomRef} />
        </div>
      )}

      {/* Initial empty state: show suggested inquiries */}
      {!isFollowUp && !loading && !error && (
        <div className="ai-suggested-wrap" style={{ marginTop: 0 }}>
          {/* already shown inside console card; hidden here */}
        </div>
      )}

      {/* First-time error (before any result) */}
      {!isFollowUp && error && (
        <div
          className="state-box"
          style={{ borderColor: 'var(--accent-burgundy)' }}
          role="alert"
        >
          <h3 style={{ color: 'var(--accent-burgundy)' }}>Research Query Notice</h3>
          <p>{error}</p>
        </div>
      )}

      {/* First-time loading (before any result) */}
      {!isFollowUp && loading && (
        <div className="ai-thinking-card" role="status">
          <div className="editorial-spinner"></div>
          <h3 className="thinking-title">Finding relevant articles &amp; writing a sourced answer</h3>
          <p className="thinking-desc">
            Searching the collected news database, then asking the AI to answer using only those articles.
          </p>
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
