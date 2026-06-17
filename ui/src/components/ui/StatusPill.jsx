const tones = {
  PENDING: 'bg-amber-50 text-amber-800 ring-amber-200',
  RETRYING: 'bg-amber-50 text-amber-800 ring-amber-200',
  READY: 'bg-blue-50 text-blue-800 ring-blue-200',
  RUNNING: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  COMPLETED: 'bg-green-50 text-green-800 ring-green-200',
  ACTIVE: 'bg-green-50 text-green-800 ring-green-200',
  FAILED: 'bg-rose-50 text-rose-800 ring-rose-200',
  DEAD: 'bg-rose-50 text-rose-800 ring-rose-200',
  CANCELED: 'bg-slate-100 text-slate-700 ring-slate-200',
  WAITING: 'bg-slate-100 text-slate-700 ring-slate-200'
};

export default function StatusPill({ status }) {
  return (
    <span className={`inline-flex min-h-6 items-center rounded-full px-2 text-xs font-bold ring-1 ${tones[status] || tones.WAITING}`}>
      {status || '-'}
    </span>
  );
}
