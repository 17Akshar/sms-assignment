import { Link, useLocation } from 'react-router-dom';

export default function Masthead() {
  const location = useLocation();
  const isFormRoute = location.pathname.includes('/students/');

  return (
    <header className="border-b border-ink/10 bg-paper">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-baseline gap-3 group">
          <span className="font-display text-2xl sm:text-3xl font-semibold text-ink tracking-tight">
            The Registrar
          </span>
          <span className="hidden sm:inline font-mono text-[11px] uppercase tracking-[0.2em] text-slate">
            Student Records
          </span>
        </Link>
        {!isFormRoute && (
          <Link
            to="/students/new"
            className="inline-flex items-center gap-2 rounded-sm bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink-light transition-colors"
          >
            <span aria-hidden="true">+</span> Admit Student
          </Link>
        )}
      </div>
      <div className="ledger-divider" />
    </header>
  );
}
