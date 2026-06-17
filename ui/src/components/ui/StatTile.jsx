export default function StatTile({ label, value, tone = 'border-blue-500' }) {
  const toneGradients = {
    'border-blue-500': 'from-blue-900/20 to-blue-800/10 border-blue-600',
    'border-emerald-500': 'from-emerald-900/20 to-emerald-800/10 border-emerald-600',
    'border-green-500': 'from-green-900/20 to-green-800/10 border-green-600',
    'border-rose-500': 'from-rose-900/20 to-rose-800/10 border-rose-600',
    'border-cyan-500': 'from-cyan-900/20 to-cyan-800/10 border-cyan-600',
    'border-amber-500': 'from-amber-900/20 to-amber-800/10 border-amber-600'
  };

  const gradient = toneGradients[tone] || toneGradients['border-blue-500'];

  return (
    <article className={`min-h-24 rounded-xl border-2 border-l-4 ${tone} bg-gradient-to-br ${gradient} p-5 shadow-lg transition-all hover:shadow-2xl hover:scale-105`}>
      <div className="text-xs font-bold uppercase text-slate-300">{label}</div>
      <div className="mt-3 text-3xl font-black bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">{value}</div>
    </article>
  );
}
