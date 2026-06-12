const tones = {
  PENDING: 'bg-amber-500/15 text-amber-300 ring-amber-400/30',
  RETRYING: 'bg-amber-500/15 text-amber-300 ring-amber-400/30',
  READY: 'bg-indigo-500/15 text-indigo-300 ring-indigo-400/30',
  RUNNING: 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/30 status-pill-running',
  COMPLETED: 'bg-green-500/15 text-green-300 ring-green-400/30',
  ACTIVE: 'bg-green-500/15 text-green-300 ring-green-400/30',
  FAILED: 'bg-rose-500/15 text-rose-300 ring-rose-400/30',
  DEAD: 'bg-rose-500/15 text-rose-300 ring-rose-400/30',
  CANCELED: 'bg-slate-500/15 text-slate-400 ring-slate-400/20',
  WAITING: 'bg-slate-500/15 text-slate-400 ring-slate-400/20'
};

export default function StatusPill({ status }) {
  return (
    <span
      className={`inline-flex min-h-6 items-center rounded-full px-2.5 text-[11px] font-bold uppercase tracking-wide ring-1 transition-all duration-300 ${tones[status] || tones.WAITING}`}
    >
      {status === 'RUNNING' ? <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> : null}
      {status || '-'}
    </span>
  );
}
