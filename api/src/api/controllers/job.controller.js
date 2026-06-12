const jobService = require('../../services/job.service');
const { httpError } = require('../middlewares/error.middleware');

async function listJobs(req, res) {
  const jobs = await jobService.listJobs(req.query);
  res.json({ jobs });
}

async function createJob(req, res) {
  const job = await jobService.createJob(req.body);
  req.app.locals.scheduler.trackJob(job);
  res.status(201).json({ job });
}

async function getJob(req, res) {
  const job = await jobService.getJob(req.params.jobId);
  if (!job) {
    throw httpError(404, 'Job not found');
  }
  res.json({ job });
}

async function updateJob(req, res) {
  const job = await jobService.updateJob(req.params.jobId, req.body);
  if (!job) {
    throw httpError(404, 'Job not found');
  }
  req.app.locals.scheduler.trackJob(job);
  res.json({ job });
}

async function deleteJob(req, res) {
  const deleted = await jobService.deleteJob(req.params.jobId);
  if (!deleted) {
    throw httpError(404, 'Job not found');
  }
  req.app.locals.scheduler.removeJob(req.params.jobId);
  res.json({ ok: true });
}

async function cancelJob(req, res) {
  const job = await jobService.cancelJob(req.params.jobId);
  if (!job) {
    throw httpError(404, 'Job not found');
  }
  req.app.locals.scheduler.removeJob(job.id);
  res.json({ job });
}

async function stats(req, res) {
  res.json({
    stats: await jobService.getStats(),
    queues: req.app.locals.scheduler.health()
  });
}

async function seedDemo(req, res) {
  const payload = await jobService.seedDemoJobs();
  await req.app.locals.scheduler.preloadWindow();
  res.status(201).json(payload);
}

module.exports = {
  cancelJob,
  createJob,
  deleteJob,
  getJob,
  listJobs,
  seedDemo,
  stats,
  updateJob
};
