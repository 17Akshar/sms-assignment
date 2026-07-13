import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { StudentsAPI, extractErrorMessage } from '../api/client.js';
import { useToast } from '../components/Toast.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import Pagination from '../components/Pagination.jsx';
import AnalyticsStrip from '../components/AnalyticsStrip.jsx';

const LIMIT = 8;

export default function StudentListPage() {
  const showToast = useToast();
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  const [search, setSearch] = useState('');
  const [year, setYear] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);

  const [pendingDelete, setPendingDelete] = useState(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await StudentsAPI.list({
        page,
        limit: LIMIT,
        search: search || undefined,
        year: year || undefined,
        sortBy,
        sortDir,
      });
      setStudents(res.data);
      setPagination(res.pagination);
    } catch (err) {
      showToast(extractErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, year, sortBy, sortDir, showToast]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    StudentsAPI.analytics().then(setAnalytics).catch(() => {});
  }, [students.length]);

  useEffect(() => {
    setPage(1);
  }, [search, year, sortBy, sortDir]);

  async function confirmDelete() {
    if (!pendingDelete) return;
    try {
      await StudentsAPI.remove(pendingDelete.id);
      showToast(`${pendingDelete.name} was dropped from the register.`);
      setPendingDelete(null);
      fetchStudents();
    } catch (err) {
      showToast(extractErrorMessage(err), 'error');
      setPendingDelete(null);
    }
  }

  function toggleSort(column) {
    if (sortBy === column) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <AnalyticsStrip analytics={analytics} />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email or admission number…"
          className="input sm:max-w-xs"
          aria-label="Search students"
        />
        <select value={year} onChange={(e) => setYear(e.target.value)} className="input sm:w-40" aria-label="Filter by year">
          <option value="">All years</option>
          {[1, 2, 3, 4, 5, 6].map((y) => (
            <option key={y} value={y}>
              Year {y}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-slate py-12 text-center">Loading records…</p>
      ) : students.length === 0 ? (
        <EmptyState hasFilters={Boolean(search || year)} />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-hidden rounded-sm border border-ink/10 shadow-card">
            <table className="w-full text-sm">
              <thead className="bg-ink text-paper">
                <tr>
                  <th className="text-left font-medium px-4 py-3 w-16"></th>
                  <SortableTh label="Admission No." column="admission_number" sortBy={sortBy} sortDir={sortDir} onSort={toggleSort} />
                  <SortableTh label="Name" column="name" sortBy={sortBy} sortDir={sortDir} onSort={toggleSort} />
                  <SortableTh label="Course" column="course" sortBy={sortBy} sortDir={sortDir} onSort={toggleSort} />
                  <SortableTh label="Year" column="year" sortBy={sortBy} sortDir={sortDir} onSort={toggleSort} />
                  <th className="text-left font-medium px-4 py-3">Contact</th>
                  <th className="text-right font-medium px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, idx) => (
                  <tr key={s.id} className={idx % 2 === 0 ? 'bg-paper' : 'bg-parchment/50'}>
                    <td className="px-4 py-3">
                      <Avatar student={s} />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gold-light bg-ink/0">
                      <span className="font-mono text-[11px] px-2 py-1 rounded-sm border border-gold/40 text-gold bg-gold/5">
                        {s.admission_number}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-ink">{s.name}</td>
                    <td className="px-4 py-3 text-slate">{s.course}</td>
                    <td className="px-4 py-3 text-slate">{s.year}</td>
                    <td className="px-4 py-3 text-slate">
                      <div>{s.email}</div>
                      <div className="text-xs">{s.mobile_number}</div>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Link to={`/students/${s.id}/edit`} className="text-xs font-medium text-sage-dark hover:underline mr-4">
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(s)}
                        className="text-xs font-medium text-brick hover:underline"
                      >
                        Drop
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {students.map((s) => (
              <div key={s.id} className="rounded-sm border border-ink/10 bg-paper shadow-card p-4">
                <div className="flex gap-3">
                  <Avatar student={s} size="lg" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-ink truncate">{s.name}</p>
                    <span className="inline-block mt-1 font-mono text-[10px] px-2 py-0.5 rounded-sm border border-gold/40 text-gold bg-gold/5">
                      {s.admission_number}
                    </span>
                    <p className="text-xs text-slate mt-1">{s.course} · Year {s.year}</p>
                    <p className="text-xs text-slate mt-1 truncate">{s.email}</p>
                  </div>
                </div>
                <div className="flex justify-end gap-4 mt-3 pt-3 border-t border-ink/10">
                  <Link to={`/students/${s.id}/edit`} className="text-xs font-medium text-sage-dark">
                    Edit
                  </Link>
                  <button type="button" onClick={() => setPendingDelete(s)} className="text-xs font-medium text-brick">
                    Drop
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={setPage} />
        </>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Drop this student?"
        description={pendingDelete ? `This will permanently remove ${pendingDelete.name} (${pendingDelete.admission_number}) from the register.` : ''}
        confirmLabel="Drop student"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

function SortableTh({ label, column, sortBy, sortDir, onSort }) {
  const active = sortBy === column;
  return (
    <th className="text-left font-medium px-4 py-3">
      <button type="button" onClick={() => onSort(column)} className="inline-flex items-center gap-1 hover:underline">
        {label}
        {active && <span aria-hidden="true">{sortDir === 'asc' ? '↑' : '↓'}</span>}
      </button>
    </th>
  );
}

function Avatar({ student, size = 'sm' }) {
  const dims = size === 'lg' ? 'h-14 w-14' : 'h-10 w-10';
  if (student.photo_url) {
    return <img src={student.photo_url} alt={student.name} className={`${dims} rounded-full object-cover border border-ink/10`} />;
  }
  const initials = student.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div className={`${dims} rounded-full bg-sage/15 text-sage-dark flex items-center justify-center text-xs font-semibold border border-sage/20`}>
      {initials}
    </div>
  );
}

function EmptyState({ hasFilters }) {
  return (
    <div className="text-center py-16 border border-dashed border-ink/20 rounded-sm">
      <p className="font-display text-lg text-ink">
        {hasFilters ? 'No matching records' : 'The register is empty'}
      </p>
      <p className="text-sm text-slate mt-1">
        {hasFilters ? 'Try a different search or clear your filters.' : 'Admit your first student to get started.'}
      </p>
      {!hasFilters && (
        <Link
          to="/students/new"
          className="inline-block mt-4 rounded-sm bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink-light"
        >
          + Admit Student
        </Link>
      )}
    </div>
  );
}
