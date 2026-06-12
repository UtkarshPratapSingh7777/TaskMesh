import { Cpu, Heart } from 'lucide-react';
import StatusPill from '../../../components/ui/StatusPill.jsx';

export default function WorkersView({ workers }) {
  return (
    <main>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="section-title">Workers</h2>
          <p className="mt-0.5 section-subtitle">Registered compute nodes and their load</p>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-300">
          {workers.length} registered
        </span>
      </div>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {workers.length === 0 ? (
          <div className="empty-state md:col-span-2 xl:col-span-3">No workers registered</div>
        ) : (
          workers.map((worker) => {
            const utilization = worker.capacity
              ? Math.min(100, Math.round((worker.load / worker.capacity) * 100))
              : 0;
            const barColor =
              utilization >= 90 ? 'bg-rose-500' : utilization >= 70 ? 'bg-amber-500' : 'bg-emerald-500';

            return (
              <article className="card card-hover" key={worker.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300">
                      <Cpu size={18} aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{worker.id}</h3>
                      <p className="mt-0.5 text-sm text-slate-400">
                        {worker.cpu} CPU · {worker.memory} GB
                      </p>
                    </div>
                  </div>
                  <StatusPill status={worker.status} />
                </div>
                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-400">
                    <span>Utilization</span>
                    <span className="text-slate-200">{utilization}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                    <span
                      className={`block h-full rounded-full transition-all duration-700 ${barColor}`}
                      style={{ width: `${utilization}%` }}
                    />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-200">
                    {worker.load}/{worker.capacity} slots
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-medium text-slate-400">
                    <Heart size={13} className="text-rose-400" aria-hidden="true" />
                    {timeAgo(worker.lastHeartbeat)}
                  </span>
                </div>
              </article>
            );
          })
        )}
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
