// frontend/components/Pagination.js
'use client';

export default function Pagination({ page, totalCount, pageSize = 20, onPageChange }) {
  const totalPages = Math.ceil((totalCount || 0) / pageSize) || 1;

  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="page-btn"
      >
        ← Previous
      </button>

      <span className="page-indicator">
        Page <strong>{page}</strong> of <strong>{totalPages}</strong>
      </span>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="page-btn"
      >
        Next →
      </button>
    </div>
  );
}

