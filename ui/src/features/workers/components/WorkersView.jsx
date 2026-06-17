import StatusPill from '../../../components/ui/StatusPill.jsx';

export default function WorkersView({ workers }) {
  return (
    <main>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-xl font-black bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">Workers</h2>
        <span className="inline-flex px-3 py-2 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 text-sm font-semibold text-white shadow-lg">{workers.length} registered</span>
      </div>
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {workers.length === 0 ? (
          <div className="rounded-xl border-2 border-slate-700 bg-slate-800/50 p-8 text-center text-slate-400 shadow-lg">No workers registered</div>
        ) : workers.map((worker) => {
          const utilization = worker.capacity ? Math.min(100, Math.round((worker.load / worker.capacity) * 100)) : 0;
          return (
            <article className="rounded-xl border-2 border-cyan-600 bg-gradient-to-br from-cyan-900/30 to-cyan-800/20 p-6 shadow-xl transition-all hover:shadow-2xl hover:border-cyan-500 hover:from-cyan-900/40" key={worker.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-white">{worker.id}</h3>
                  <p className="mt-2 text-sm text-slate-300">{worker.cpu} CPU, {worker.memory} GB</p>
                </div>
                <StatusPill status={worker.status} />
              </div>
              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-300">Utilization</span>
                  <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{utilization}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-700/50 border border-slate-600">
                  <span className={`block h-full transition-all ${utilization > 80 ? 'bg-gradient-to-r from-red-600 to-red-500' : utilization > 50 ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-emerald-500 to-green-500'}`} style={{ width: `${utilization}%` }} />
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-slate-700 pt-4">
                <span className="text-sm font-bold text-slate-100">{worker.load}/{worker.capacity} slots</span>
                <span className="text-xs font-semibold text-slate-400">{timeAgo(worker.lastHeartbeat)}</span>
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
