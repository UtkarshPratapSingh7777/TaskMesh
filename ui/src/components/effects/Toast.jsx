import { CheckCircle2, X } from 'lucide-react';
import { useEffect } from 'react';

export default function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, 3800);
    return () => window.clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="toast-enter fixed bottom-6 right-6 z-50 flex max-w-sm items-start gap-3 rounded-2xl border border-emerald-400/30 bg-slate-900/90 px-4 py-3 shadow-2xl shadow-emerald-500/20 backdrop-blur-xl">
      <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-400" size={20} aria-hidden="true" />
      <div className="flex-1">
        <p className="text-sm font-bold text-white">Job Created</p>
        <p className="mt-0.5 text-sm text-slate-300">{message}</p>
      </div>
      <button
        className="rounded-lg p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
        type="button"
        onClick={onClose}
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
}
