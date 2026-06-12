export default function Button({ children, className = '', tone = 'primary', glowing = false, ...props }) {
  const tones = {
    primary:
      'border-transparent bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:brightness-110 active:scale-[0.97]',
    neutral:
      'border-white/15 bg-white/5 text-slate-200 shadow-sm hover:border-white/25 hover:bg-white/10 active:scale-[0.97]',
    danger:
      'border-rose-400/30 bg-rose-500/10 text-rose-300 shadow-sm hover:border-rose-400/50 hover:bg-rose-500/20 active:scale-[0.97]'
  };

  return (
    <button
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 ${tones[tone]} ${glowing ? 'btn-glow' : ''} ${className}`}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}
