export default function ConfirmDialog({ open, title, description, confirmLabel = 'Confirm', onConfirm, onCancel, danger = true }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-sm rounded-sm bg-paper border border-ink/10 shadow-card p-6">
        <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
        {description && <p className="mt-2 text-sm text-slate">{description}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-sm px-4 py-2 text-sm font-medium text-ink border border-ink/20 hover:bg-parchment transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-sm px-4 py-2 text-sm font-medium text-paper transition-colors ${
              danger ? 'bg-brick hover:bg-brick-light' : 'bg-sage hover:bg-sage-light'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
