import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import DashboardLayout from './components/layouts/DashboardLayout.jsx';
import JobsView from './features/jobs/components/JobsView.jsx';
import { cancelJob, createJob, getJobStats, listJobs, seedDemoJobs } from './features/jobs/api/jobs.api.js';
import WorkersView from './features/workers/components/WorkersView.jsx';
import WorkflowsView from './features/workflows/components/WorkflowsView.jsx';
import { api, unwrap } from './lib/axios.js';
import { queryClient } from './lib/react-query.js';

export default function App() {
  const [activeTab, setActiveTab] = useState('jobs');
  const jobsQuery = useQuery({ queryKey: ['jobs'], queryFn: listJobs });
  const workersQuery = useQuery({ queryKey: ['workers'], queryFn: () => unwrap(api.get('/workers')) });
  const workflowsQuery = useQuery({ queryKey: ['workflows'], queryFn: () => unwrap(api.get('/workflows')) });
  const statsQuery = useQuery({ queryKey: ['stats'], queryFn: getJobStats });

  const createJobMutation = useMutation({
    mutationFn: createJob,
    onSuccess: refresh
  });
  const cancelJobMutation = useMutation({
    mutationFn: cancelJob,
    onSuccess: refresh
  });
  const seedMutation = useMutation({
    mutationFn: seedDemoJobs,
    onSuccess: refresh
  });
  const createWorkflowMutation = useMutation({
    mutationFn: (payload) => unwrap(api.post('/workflows', payload)),
    onSuccess: refresh
  });

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ['jobs'] });
    queryClient.invalidateQueries({ queryKey: ['workers'] });
    queryClient.invalidateQueries({ queryKey: ['workflows'] });
    queryClient.invalidateQueries({ queryKey: ['stats'] });
  }

  const jobs = jobsQuery.data?.jobs || [];
  const workers = workersQuery.data?.workers || [];
  const workflows = workflowsQuery.data?.workflows || [];
  const stats = statsQuery.data?.stats || {};
  const error = jobsQuery.error || workersQuery.error || workflowsQuery.error || statsQuery.error;

  return (
    <DashboardLayout
      activeTab={activeTab}
      onRefresh={refresh}
      onSeed={() => seedMutation.mutate()}
      onTabChange={setActiveTab}
      stats={stats}
    >
      {error ? (
        <div className="mb-5 rounded-xl border-2 border-red-600 bg-red-900/30 px-5 py-4 text-sm font-semibold text-red-200 shadow-lg">
          {error.message}
        </div>
      ) : null}

      {activeTab === 'jobs' ? (
        <JobsView
          jobs={jobs}
          onCancel={(jobId) => cancelJobMutation.mutateAsync(jobId)}
          onCreate={(payload) => createJobMutation.mutateAsync(payload)}
        />
      ) : null}
      {activeTab === 'workers' ? <WorkersView workers={workers} /> : null}
      {activeTab === 'workflows' ? (
        <WorkflowsView
          workflows={workflows}
          onCreate={(payload) => createWorkflowMutation.mutateAsync(payload)}
        />
      ) : null}
    </DashboardLayout>
  );
}
