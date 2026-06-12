import AnimatedCounter from './AnimatedCounter.jsx';

const accentStyles = {
  'border-blue-500': 'from-blue-500/20 to-transparent text-blue-300',
  'border-emerald-500': 'from-emerald-500/20 to-transparent text-emerald-300',
  'border-green-500': 'from-green-500/20 to-transparent text-green-300',
  'border-rose-500': 'from-rose-500/20 to-transparent text-rose-300',
  'border-cyan-500': 'from-cyan-500/20 to-transparent text-cyan-300',
  'border-amber-500': 'from-amber-500/20 to-transparent text-amber-300'
};

export default function StatTile({ label, value, tone = 'border-blue-500' }) {
  const accent = accentStyles[tone] || accentStyles['border-blue-500'];

  return (
    <article className="card card-hover group relative overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-70 transition-opacity duration-300 group-hover:opacity-100`} />
      <div className="relative">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</div>
        <div className="mt-2 text-2xl font-extrabold tracking-tight text-white">
          <AnimatedCounter value={value} />
        </div>
      </div>
    </article>
  );
}
