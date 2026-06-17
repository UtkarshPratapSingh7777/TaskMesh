export default function Button({ children, className = '', tone = 'primary', ...props }) {
  const tones = {
    primary: 'border-blue-500 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl hover:shadow-blue-900/50',
    neutral: 'border-slate-600 bg-gradient-to-r from-slate-700 to-slate-800 text-slate-100 hover:from-slate-600 hover:to-slate-700 shadow-md hover:shadow-lg',
    danger: 'border-red-500 bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl hover:shadow-red-900/50'
  };

  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-semibold transition ${tones[tone]} ${className}`}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}
