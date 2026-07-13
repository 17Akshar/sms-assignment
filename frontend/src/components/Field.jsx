export default function Field({ label, htmlFor, error, children, hint }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-ink mb-1.5">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate">{hint}</p>}
      {error && (
        <p className="mt-1 text-xs text-brick" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
