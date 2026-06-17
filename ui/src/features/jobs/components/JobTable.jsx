import { XCircle } from 'lucide-react';
import Button from '../../../components/ui/Button.jsx';
import StatusPill from '../../../components/ui/StatusPill.jsx';

export default function JobTable({ jobs, onCancel }) {
  return (
    <div className="overflow-x-auto rounded-xl border-2 border-green-600 bg-gradient-to-br from-slate-800 to-slate-900 shadow-xl">
      <table className="w-full min-w-[860px] border-collapse text-left text-sm">
        <thead className="bg-gradient-to-r from-slate-700 to-slate-800 text-xs uppercase font-bold text-green-300 border-b-2 border-green-600">
          <tr>
            <th className="px-5 py-4">Name</th>
            <th className="px-5 py-4">Status</th>
            <th className="px-5 py-4">Priority</th>
            <th className="px-5 py-4">Attempts</th>
            <th className="px-5 py-4">Run At</th>
            <th className="px-5 py-4">Worker</th>
            <th className="px-5 py-4"></th>
          </tr>
        </thead>
        <tbody>
          {jobs.length === 0 ? (
            <tr>
              <td className="px-5 py-8 text-center text-slate-400" colSpan="7">No jobs yet</td>
            </tr>
          ) : jobs.map((job) => (
            <tr className="border-t border-slate-700 hover:bg-slate-700/50 transition cursor-default" key={job.id}>
              <td className="px-5 py-4">
                <div className="font-bold text-white">{job.name}</div>
                <div className="mt-1 text-xs text-slate-400">{job.id}</div>
              </td>
              <td className="px-5 py-4"><StatusPill status={job.status} /></td>
              <td className="px-5 py-4"><span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-purple-600 text-xs font-bold text-white shadow-lg">{job.priority}</span></td>
              <td className="px-5 py-4"><span className="text-sm font-semibold text-cyan-300">{job.attempts}/{job.maxAttempts}</span></td>
              <td className="px-5 py-4 text-slate-300">{formatDate(job.runAt)}</td>
              <td className="px-5 py-4"><span className="text-slate-200 font-medium">{job.assignedWorker || '-'}</span></td>
              <td className="px-5 py-4">
                {!isTerminal(job.status) ? (
                  <Button tone="danger" onClick={() => onCancel(job.id)}>
                    <XCircle size={16} aria-hidden="true" />
                    Cancel
                  </Button>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
    : '-';
}
