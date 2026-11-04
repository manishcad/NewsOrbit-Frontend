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
