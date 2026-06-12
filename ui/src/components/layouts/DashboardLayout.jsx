import { Briefcase, Database, GitBranch, Play, RefreshCw, Server } from 'lucide-react';
import Button from '../ui/Button.jsx';
import LiveIndicator from '../ui/LiveIndicator.jsx';
import StatTile from '../ui/StatTile.jsx';

const tabs = [
  ['jobs', 'Jobs', Briefcase],
  ['workers', 'Workers', Server],
  ['workflows', 'Workflows', GitBranch]
];

export default function DashboardLayout({ activeTab, children, onRefresh, onSeed, onTabChange, stats }) {
  const counts = stats?.jobs || {};
  const tiles = [
    ['Queue Depth', stats?.queueDepth || 0, 'border-blue-500'],
    ['Running', counts.RUNNING || 0, 'border-emerald-500'],
    ['Completed', counts.COMPLETED || 0, 'border-green-500'],
    ['Failed', counts.FAILED || 0, 'border-rose-500'],
    ['Workers', stats?.activeWorkers || 0, 'border-cyan-500'],
    ['Failure Rate', `${Math.round((stats?.failureRate || 0) * 100)}%`, 'border-amber-500']
  ];

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
      <header className="card flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/40">
            <Database size={22} aria-hidden="true" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xl font-bold uppercase tracking-widest text-indigo-300">TaskMesh</span>
              <LiveIndicator />
            </div>
            <h1 className="mt-0.5 text-2xl font-extrabold tracking-tight text-white">Scheduler Dashboard</h1>
            <p className="mt-1 text-sm font-medium text-slate-400">Real-time job orchestration with live workflow visualization</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Button tone="neutral" onClick={onSeed}>
            <Play size={16} aria-hidden="true" />
            Seed Demo
          </Button>
          <Button glowing onClick={onRefresh}>
            <RefreshCw size={16} aria-hidden="true" />
            Refresh
          </Button>
        </div>
      </header>

      <section className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
        {tiles.map(([label, value, tone]) => (
          <StatTile key={label} label={label} tone={tone} value={value} />
        ))}
      </section>

      <nav
        className="mt-6 inline-flex w-full gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/40 p-1.5 backdrop-blur-xl sm:w-auto"
        aria-label="Dashboard views"
      >
        {tabs.map(([id, label, Icon]) => (
          <button
            className={`tab-pill inline-flex items-center gap-2 ${
              activeTab === id ? 'tab-pill-active' : 'tab-pill-inactive'
            }`}
            key={id}
            type="button"
            onClick={() => onTabChange(id)}
          >
            <Icon size={15} aria-hidden="true" />
            {label}
          </button>
        ))}
      </nav>

      <div className="mt-6">{children}</div>
    </div>
  );
}
