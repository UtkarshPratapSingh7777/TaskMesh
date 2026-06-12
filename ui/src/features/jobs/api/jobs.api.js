import { api, unwrap } from '../../../lib/axios.js';

export function listJobs() {
  return unwrap(api.get('/jobs'));
}

export function createJob(payload) {
  return unwrap(api.post('/jobs', payload));
}

export function cancelJob(jobId) {
  return unwrap(api.post(`/jobs/${jobId}/cancel`));
}

export function seedDemoJobs() {
  return unwrap(api.post('/jobs/demo'));
}

export function getJobStats() {
  return unwrap(api.get('/jobs/stats'));
}
