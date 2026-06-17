import { Database, Play, RefreshCw, Zap, TrendingUp, CheckCircle2, AlertCircle, Users, Gauge } from 'lucide-react';
import Button from '../ui/Button.jsx';
import StatTile from '../ui/StatTile.jsx';

const tabs = [
  ['jobs', 'Jobs'],
  ['workers', 'Workers'],
  ['workflows', 'Workflows']
];

export default function DashboardLayout({ activeTab, children, onRefresh, onSeed, onTabChange, stats }) {
  const counts = stats?.jobs || {};

  return (
    <div className="mx-auto min-h-screen w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-5 rounded-2xl bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 p-8 shadow-2xl border border-slate-700 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            {/* <Database size={20} aria-hidden="true" /> */}
            <span className='text-3xl'>TaskMesh</span>
          </div>
          <h1 className="mt-2 text-4xl font-black bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">Scheduler Dashboard</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button tone="neutral" onClick={onSeed}>
            <Play size={18} aria-hidden="true" />
            Seed Demo
          </Button>
          <Button onClick={onRefresh}>
            <RefreshCw size={18} aria-hidden="true" />
            Refresh
          </Button>
        </div>
      </header>
      <section className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatTile label="Queue Depth" value={stats?.queueDepth || 0} tone="border-blue-500" icon={Zap}/>
        <StatTile label="Running" value={counts.RUNNING || 0} tone="border-emerald-500" icon={TrendingUp}/>
        <StatTile label="Completed" value={counts.COMPLETED || 0} tone="border-green-500" icon={CheckCircle2}/>
        <StatTile label="Failed" value={counts.FAILED || 0} tone="border-rose-500" icon={AlertCircle}/>
        <StatTile label="Workers" value={stats?.activeWorkers || 0} tone="border-cyan-500" icon={Users}/>
        <StatTile label="Failure Rate" value={`${Math.round((stats?.failureRate || 0) * 100)}%`}tone="border-amber-500" icon={Gauge}/>
      </section>
      <nav className="mt-8 flex overflow-x-auto rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 shadow-xl border border-slate-700 p-2" aria-label="Dashboard views">
        {tabs.map(([id, label]) => (
          <button
            className={`min-h-12 min-w-32 px-5 text-sm font-bold rounded-lg transition cursor-pointer ${
              activeTab === id
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg border border-blue-500'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50 border border-transparent'
            }`}
            key={id}
            type="button"
            onClick={() => onTabChange(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="mt-8">{children}</div>
    </div>
  );
}
