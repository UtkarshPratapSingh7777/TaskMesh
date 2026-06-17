import { Database, Play, RefreshCw } from 'lucide-react';
import Button from '../ui/Button.jsx';
import StatTile from '../ui/StatTile.jsx';

const tabs = [
  ['jobs', 'Jobs'],
  ['workers', 'Workers'],
  ['workflows', 'Workflows']
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
    <div className="mx-auto min-h-screen w-full max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-blue-700">
            <Database size={18} aria-hidden="true" />
            <span>FlowForge</span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-slate-950">Scheduler Dashboard</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button tone="neutral" onClick={onSeed}>
            <Play size={16} aria-hidden="true" />
            Seed Demo
          </Button>
          <Button onClick={onRefresh}>
            <RefreshCw size={16} aria-hidden="true" />
            Refresh
          </Button>
        </div>
      </header>

      <section className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
        {tiles.map(([label, value, tone]) => (
          <StatTile key={label} label={label} tone={tone} value={value} />
        ))}
      </section>

      <nav className="mt-5 flex overflow-x-auto border-b border-slate-200" aria-label="Dashboard views">
        {tabs.map(([id, label]) => (
          <button
            className={`min-h-11 min-w-28 border-b-2 px-4 text-sm font-bold transition ${
              activeTab === id
                ? 'border-blue-600 text-slate-950'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
            key={id}
            type="button"
            onClick={() => onTabChange(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="mt-5">{children}</div>
    </div>
  );
}
