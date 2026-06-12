import { XCircle } from 'lucide-react';
import Button from '../../../components/ui/Button.jsx';
import StatusPill from '../../../components/ui/StatusPill.jsx';

export default function JobTable({ jobs, onCancel, highlightedJobId = '' }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 shadow-xl shadow-black/20 backdrop-blur-xl">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">Name</th>
              <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">Status</th>
              <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">Priority</th>
              <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">Attempts</th>
              <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">Run At</th>
              <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">Worker</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 ? (
              <tr>
                <td className="px-5 py-12 text-center text-sm font-medium text-slate-500" colSpan="7">
                  No jobs yet — create one to get started
                </td>
              </tr>
            ) : (
              jobs.map((job) => (
                <tr
                  className={`border-t border-white/5 transition-colors hover:bg-indigo-500/10 ${
                    job.id === highlightedJobId ? 'job-row-new' : ''
                  }`}
                  key={job.id}
                >
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-white">{job.name}</div>
                    <div className="mt-0.5 font-mono text-xs text-slate-500">{job.id}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusPill status={job.status} />
                  </td>
                  <td className="px-5 py-3.5 font-medium text-slate-300">{job.priority}</td>
                  <td className="px-5 py-3.5 font-medium text-slate-300">
                    {job.attempts}/{job.maxAttempts}
                  </td>
                  <td className="px-5 py-3.5 text-slate-400">{formatDate(job.runAt)}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{job.assignedWorker || '—'}</td>
                  <td className="px-5 py-3.5">
                    {!isTerminal(job.status) ? (
                      <Button tone="danger" onClick={() => onCancel(job.id)}>
                        <XCircle size={16} aria-hidden="true" />
                        Cancel
                      </Button>
                    ) : null}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function isTerminal(status) {
  return ['COMPLETED', 'FAILED', 'CANCELED'].includes(status);
}

function formatDate(value) {
  return value
    ? new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(new Date(value))
    : '—';
}
