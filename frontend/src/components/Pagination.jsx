export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-ink/10 pt-4 mt-4">
      <p className="text-xs text-slate">
        Page <span className="font-medium text-ink">{page}</span> of{' '}
        <span className="font-medium text-ink">{totalPages}</span>
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="rounded-sm border border-ink/20 px-3 py-1.5 text-xs font-medium disabled:opacity-40 hover:bg-parchment transition-colors"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          className="rounded-sm border border-ink/20 px-3 py-1.5 text-xs font-medium disabled:opacity-40 hover:bg-parchment transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
