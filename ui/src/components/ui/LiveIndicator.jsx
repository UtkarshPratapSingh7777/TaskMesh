export default function LiveIndicator() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-300">
      <span className="live-dot" />
      Live
    </span>
  );
}
