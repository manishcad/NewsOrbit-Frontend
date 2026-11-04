// frontend/components/SearchBar.js
'use client';

export default function SearchBar({
  search,
  onSearchChange,
  source,
  onSourceChange,
  sources = [],
}) {
  return (
    <div className="filter-selects">
      <form
        className="filter-search-form"
        onSubmit={(e) => {
          e.preventDefault();
          onSearchChange(new FormData(e.currentTarget).get('search') || '');
        }}
      >
        <input
          key={search}
          type="search"
          name="search"
          defaultValue={search}
          placeholder="Search headlines, summaries..."
          className="filter-search-input"
          aria-label="Search articles"
        />
        <button type="submit" className="filter-search-button">Search</button>
      </form>
      <select
        value={source}
        onChange={(e) => onSourceChange(e.target.value)}
        className="select-source"
        aria-label="Filter by News Source"
      >
        <option value="">All News Sources</option>
        {sources.map((src) => {
          const name = typeof src === 'string' ? src : src.name || src.source_name;
          return (
            <option key={name} value={name}>
              {name}
            </option>
          );
        })}
      </select>
    </div>
  );
}
