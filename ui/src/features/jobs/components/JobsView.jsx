import { Plus, Sparkles } from 'lucide-react';
import { useCallback, useState } from 'react';
import ConfettiBurst from '../../../components/effects/ConfettiBurst.jsx';
import Toast from '../../../components/effects/Toast.jsx';
import Button from '../../../components/ui/Button.jsx';
import JobTable from './JobTable.jsx';

export default function JobsView({ jobs, onCancel, onCreate }) {
  const [form, setForm] = useState({
    name: 'Email digest',
    priority: 5,
    delaySeconds: 5,
    maxAttempts: 4,
    payload: '{"kind":"email","tenant":"demo"}'
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [toast, setToast] = useState('');
  const [highlightedJobId, setHighlightedJobId] = useState('');

  const clearConfetti = useCallback(() => setConfetti(false), []);
  const clearToast = useCallback(() => setToast(''), []);

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const result = await onCreate({
        name: form.name,
        priority: Number(form.priority),
        delaySeconds: Number(form.delaySeconds),
        maxAttempts: Number(form.maxAttempts),
        payload: JSON.parse(form.payload || '{}')
      });
      setError('');
      setConfetti(true);
      setToast(`"${result.job.name}" has been queued successfully`);
      setHighlightedJobId(result.job.id);
      window.setTimeout(() => setHighlightedJobId(''), 5000);
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <ConfettiBurst active={confetti} onDone={clearConfetti} />
      {toast ? <Toast message={toast} onClose={clearToast} /> : null}

      <main className="grid gap-5 lg:grid-cols-[minmax(320px,420px)_1fr]">
        <section className={`card transition-all duration-500 ${submitting ? 'ring-2 ring-indigo-400/40' : ''}`}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="section-title">Create Job</h2>
            <Sparkles className="text-indigo-400" size={18} aria-hidden="true" />
          </div>
          <p className="mt-1 section-subtitle">Queue a new task — watch it appear live in the table</p>
          <form className="mt-5 grid gap-4" onSubmit={submit}>
            <label className="form-label">
              Name
              <input
                className="form-input"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                required
              />
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <label className="form-label">
                Priority
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  max="100"
                  value={form.priority}
                  onChange={(event) => setForm({ ...form, priority: event.target.value })}
                />
              </label>
              <label className="form-label">
                Delay
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  value={form.delaySeconds}
                  onChange={(event) => setForm({ ...form, delaySeconds: event.target.value })}
                />
              </label>
              <label className="form-label">
                Attempts
                <input
                  className="form-input"
                  type="number"
                  min="1"
                  max="20"
                  value={form.maxAttempts}
                  onChange={(event) => setForm({ ...form, maxAttempts: event.target.value })}
                />
              </label>
            </div>
            <label className="form-label">
              Payload
              <textarea
                className="form-textarea min-h-32"
                value={form.payload}
                onChange={(event) => setForm({ ...form, payload: event.target.value })}
              />
            </label>
            {error ? <p className="alert-error">{error}</p> : null}
            <Button className="w-full" glowing disabled={submitting} type="submit">
              <Plus size={16} aria-hidden="true" />
              {submitting ? 'Creating…' : 'Create Job'}
            </Button>
          </form>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="section-title">Jobs</h2>
              <p className="mt-0.5 section-subtitle">Updates every 2.5s — new jobs animate in</p>
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-300">
              {jobs.length} total
            </span>
          </div>
          <JobTable highlightedJobId={highlightedJobId} jobs={jobs} onCancel={onCancel} />
        </section>
      </main>
    </>
  );
}
