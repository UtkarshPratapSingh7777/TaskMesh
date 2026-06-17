const tones = {
  PENDING: 'bg-amber-900/40 text-amber-200 ring-1 ring-amber-600 border border-amber-600',
  RETRYING: 'bg-amber-900/40 text-amber-200 ring-1 ring-amber-600 border border-amber-600',
  READY: 'bg-blue-900/40 text-blue-200 ring-1 ring-blue-600 border border-blue-600',
  RUNNING: 'bg-emerald-900/40 text-emerald-200 ring-1 ring-emerald-600 border border-emerald-600',
  COMPLETED: 'bg-green-900/40 text-green-200 ring-1 ring-green-600 border border-green-600',
  ACTIVE: 'bg-green-900/40 text-green-200 ring-1 ring-green-600 border border-green-600',
  FAILED: 'bg-red-900/40 text-red-200 ring-1 ring-red-600 border border-red-600',
  DEAD: 'bg-red-900/40 text-red-200 ring-1 ring-red-600 border border-red-600',
  CANCELED: 'bg-slate-700/40 text-slate-300 ring-1 ring-slate-600 border border-slate-600',
  WAITING: 'bg-slate-700/40 text-slate-300 ring-1 ring-slate-600 border border-slate-600'
};

export default function StatusPill({ status }) {
  return (
    <span className={`inline-flex min-h-7 items-center rounded-full px-3 py-1 text-xs font-bold ${tones[status] || tones.WAITING}`}>
      {status || '-'}
    </span>
  );
}
