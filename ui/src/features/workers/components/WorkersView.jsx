import StatusPill from '../../../components/ui/StatusPill.jsx';

export default function WorkersView({ workers }) {
  return (
    <main>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-base font-black text-slate-950">Workers</h2>
        <span className="text-sm font-semibold text-slate-500">{workers.length} registered</span>
      </div>
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {workers.length === 0 ? (
          <div className="rounded-md border border-slate-200 bg-white p-8 text-center text-slate-500">No workers registered</div>
        ) : workers.map((worker) => {
          const utilization = worker.capacity ? Math.min(100, Math.round((worker.load / worker.capacity) * 100)) : 0;
          return (
            <article className="rounded-md border border-slate-200 bg-white p-4" key={worker.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-slate-950">{worker.id}</h3>
                  <p className="mt-1 text-sm text-slate-500">{worker.cpu} CPU, {worker.memory} GB</p>
                </div>
                <StatusPill status={worker.status} />
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                <span className="block h-full bg-emerald-500" style={{ width: `${utilization}%` }} />
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="font-bold text-slate-950">{worker.load}/{worker.capacity} slots</span>
                <span className="font-semibold text-slate-500">{timeAgo(worker.lastHeartbeat)}</span>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}

function timeAgo(value) {
  if (!value) {
    return 'never';
  }
  const seconds = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 2) {
    return 'just now';
  }
  if (seconds < 60) {
    return `${seconds}s ago`;
  }
  return `${Math.round(seconds / 60)}m ago`;
}
