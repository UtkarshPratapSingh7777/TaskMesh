export default function Button({ children, className = '', tone = 'primary', ...props }) {
  const tones = {
    primary: 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700',
    neutral: 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50',
    danger: 'border-rose-300 bg-white text-rose-700 hover:bg-rose-50'
  };

  return (
    <button
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md border px-3 text-sm font-semibold transition ${tones[tone]} ${className}`}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}
