import { XCircle } from 'lucide-react';
import Button from '../../../components/ui/Button.jsx';
import StatusPill from '../../../components/ui/StatusPill.jsx';

export default function JobTable({ jobs, onCancel }) {
  return (
    <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
      <table className="w-full min-w-[860px] border-collapse text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Priority</th>
            <th className="px-4 py-3">Attempts</th>
            <th className="px-4 py-3">Run At</th>
            <th className="px-4 py-3">Worker</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {jobs.length === 0 ? (
            <tr>
              <td className="px-4 py-8 text-center text-slate-500" colSpan="7">No jobs yet</td>
            </tr>
          ) : jobs.map((job) => (
            <tr className="border-t border-slate-100" key={job.id}>
              <td className="px-4 py-3">
                <div className="font-bold text-slate-950">{job.name}</div>
                <div className="mt-1 text-xs text-slate-500">{job.id}</div>
              </td>
              <td className="px-4 py-3"><StatusPill status={job.status} /></td>
              <td className="px-4 py-3">{job.priority}</td>
              <td className="px-4 py-3">{job.attempts}/{job.maxAttempts}</td>
              <td className="px-4 py-3">{formatDate(job.runAt)}</td>
              <td className="px-4 py-3">{job.assignedWorker || '-'}</td>
              <td className="px-4 py-3">
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
