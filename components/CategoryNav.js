// frontend/components/CategoryNav.js
'use client';

const CATEGORIES = [
  { id: '', label: 'All Desks' },
  { id: 'national', label: 'National' },
  { id: 'international', label: 'World' },
  { id: 'technology', label: 'Technology' },
  { id: 'business', label: 'Business' },
  { id: 'politics', label: 'Politics' },
  { id: 'science', label: 'Science' },
  { id: 'sports', label: 'Sports' },
  { id: 'health', label: 'Health' },
  { id: 'entertainment', label: 'Entertainment' },
];

export default function CategoryNav({ currentCategory, onSelectCategory }) {
  return (
    <div className="category-pills">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          type="button"
          onClick={() => onSelectCategory(cat.id)}
          className={`pill-btn ${currentCategory === cat.id ? 'active' : ''}`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
