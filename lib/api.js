// frontend/lib/api.js
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

async function fetchJson(url, options = {}) {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.error(`API fetch error at ${url}:`, err);
    throw err;
  }
}

export async function getArticles({ page = 1, category = '', source = '', search = '' } = {}) {
  const params = new URLSearchParams();
  if (page) params.set('page', page);
  if (category) params.set('category', category);
  if (source) params.set('source', source);
  if (search) params.set('search', search);

  return fetchJson(`${API_BASE}/news/articles/?${params.toString()}`);
}

export async function getArticleById(id) {
  return fetchJson(`${API_BASE}/news/articles/${id}/`);
}

export async function getCategories() {
  return fetchJson(`${API_BASE}/news/categories/`);
}

export async function getSources() {
  return fetchJson(`${API_BASE}/news/sources/`);
}

export async function getStats(days = 30) {
  return fetchJson(`${API_BASE}/news/stats/?days=${days}`);
}

export async function triggerScrape(source = 'all') {
  return fetchJson(`${API_BASE}/scraper/trigger/`, {
    method: 'POST',
    body: JSON.stringify({ source }),
  });
}

export async function submitAIQuery(query, maxArticles = 12) {
  return fetchJson(`${API_BASE}/ai/query/`, {
    method: 'POST',
    body: JSON.stringify({ query, max_articles: maxArticles }),
  });
}

