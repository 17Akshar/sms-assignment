export default function AnalyticsStrip({ analytics }) {
  if (!analytics) return null;

  const topCourse = analytics.byCourse?.[0];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      <StatCard label="Total students" value={analytics.totalStudents} />
      <StatCard label="Courses offered" value={analytics.byCourse?.length ?? 0} />
      <StatCard label="Top course" value={topCourse ? topCourse.course : '—'} small />
      <StatCard
        label="Gender split"
        value={
          analytics.byGender?.length
            ? analytics.byGender.map((g) => `${g.gender[0]} ${g.count}`).join(' · ')
            : '—'
        }
        small
      />
    </div>
  );
}

function StatCard({ label, value, small }) {
  return (
    <div className="rounded-sm border border-ink/10 bg-parchment/60 px-4 py-3">
      <p className="text-[10px] uppercase tracking-[0.15em] text-slate font-medium">{label}</p>
      <p className={`mt-1 font-display ${small ? 'text-base' : 'text-2xl'} text-ink font-semibold truncate`}>
        {value}
      </p>
    </div>
  );
}
