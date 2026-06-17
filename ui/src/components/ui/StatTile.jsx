export default function StatTile({ label, value, tone = 'border-blue-500' }) {
  return (
    <article className={`min-h-24 rounded-md border border-slate-200 border-l-4 ${tone} bg-white p-4`}>
      <div className="text-xs font-bold uppercase text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-black text-slate-950">{value}</div>
    </article>
  );
}
