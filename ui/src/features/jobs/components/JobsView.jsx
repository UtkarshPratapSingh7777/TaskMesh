import { Plus } from 'lucide-react';
import { useState } from 'react';
import Button from '../../../components/ui/Button.jsx';
import JobTable from './JobTable.jsx';

export default function JobsView({ jobs, onCancel, onCreate }) {
  const [form, setForm] = useState({
    name: 'Email',
    priority: 5,
    delaySeconds: 5,
    maxAttempts: 4,
    payload: '{"kind":"email","tenant":"demo"}'
  });
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();

    try {
      await onCreate({
        name: form.name,
        priority: Number(form.priority),
        delaySeconds: Number(form.delaySeconds),
        maxAttempts: Number(form.maxAttempts),
        payload: JSON.parse(form.payload || '{}')
      });

      setError('');
    } catch (nextError) {
      setError(nextError.message);
    }
  }

  return (
    <main className="grid gap-6 lg:grid-cols-[minmax(360px,480px)_1fr]">
      <section className="rounded-2xl border-2 border-blue-600 bg-gradient-to-br from-blue-900/30 to-blue-800/20 p-6 shadow-xl">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-black bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
            Create Job
          </h2>
        </div>

        <form className="mt-6 grid gap-4" onSubmit={submit}>
          <label className="grid gap-2 text-sm font-bold text-slate-200">
            Name
            <input
              className="w-full min-h-11 rounded-lg border border-blue-600 bg-slate-800/50 px-4 text-white placeholder-slate-500 transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/50"
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
              required
            />
          </label>

          <div className="grid grid-cols-3 gap-4">
            <label className="grid min-w-0 gap-2 text-sm font-bold text-slate-200">
              Priority
              <input
                type="number"
                min="0"
                max="100"
                value={form.priority}
                onChange={(event) =>
                  setForm({ ...form, priority: event.target.value })
                }
                className="w-full min-h-11 rounded-lg border border-purple-600 bg-slate-800/50 px-4 text-white transition focus:border-purple-400 focus:ring-2 focus:ring-purple-500/50"
              />
            </label>

            <label className="grid min-w-0 gap-2 text-sm font-bold text-slate-200">
              Delay
              <input
                type="number"
                min="0"
                value={form.delaySeconds}
                onChange={(event) =>
                  setForm({ ...form, delaySeconds: event.target.value })
                }
                className="w-full min-h-11 rounded-lg border border-cyan-600 bg-slate-800/50 px-4 text-white transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/50"
              />
            </label>

            <label className="grid min-w-0 gap-2 text-sm font-bold text-slate-200">
              Attempts
              <input
                type="number"
                min="1"
                max="20"
                value={form.maxAttempts}
                onChange={(event) =>
                  setForm({ ...form, maxAttempts: event.target.value })
                }
                className="w-full min-h-11 rounded-lg border border-green-600 bg-slate-800/50 px-4 text-white transition focus:border-green-400 focus:ring-2 focus:ring-green-500/50"
              />
            </label>
          </div>

          <label className="grid gap-2 text-sm font-bold text-slate-200">
            Payload
            <textarea
              className="w-full min-h-32 resize-y rounded-lg border border-pink-600 bg-slate-800/50 px-4 py-3 font-mono text-sm text-white placeholder-slate-500 transition focus:border-pink-400 focus:ring-2 focus:ring-pink-500/50"
              value={form.payload}
              onChange={(event) =>
                setForm({ ...form, payload: event.target.value })
              }
            />
          </label>

          {error ? (
            <p className="rounded-lg border border-red-600 bg-red-900/30 px-4 py-3 text-sm font-semibold text-red-300 shadow-lg">
              {error}
            </p>
          ) : null}

          <Button
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-lg py-3"
            type="submit"
          >
            <Plus size={20} aria-hidden="true" />
            Create Job
          </Button>
        </form>
      </section>

      <section>
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-xl font-black bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent">
            Jobs
          </h2>

          <span className="inline-flex rounded-full bg-gradient-to-r from-green-600 to-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-lg">
            {jobs.length} total
          </span>
        </div>

        <JobTable jobs={jobs} onCancel={onCancel} />
      </section>
    </main>
  );
}