const jobService = require('../../services/job.service');
const workerService = require('../../services/worker.service');
const workflowService = require('../../services/workflow.service');
const { httpError } = require('../middlewares/error.middleware');

async function listWorkers(req, res) {
  res.json({ workers: await workerService.listWorkers() });
}

async function register(req, res) {
  const worker = await workerService.registerWorker(req.body);
  res.status(201).json({ worker });
}

async function heartbeat(req, res) {
  const workerId = req.body.workerId || req.body.id;
  const worker = await workerService.heartbeat(workerId);
  if (!worker) {
    throw httpError(404, 'Worker not found');
  }
  res.json({ worker });
}

async function getWorker(req, res) {
  const worker = await workerService.getWorker(req.params.workerId);
  if (!worker) {
    throw httpError(404, 'Worker not found');
  }
  res.json({ worker });
}

async function assignments(req, res) {
  const worker = await workerService.getWorker(req.params.workerId);
  if (!worker) {
    throw httpError(404, 'Worker not found');
  }
  res.json({ jobs: await jobService.listAssignedJobs(req.params.workerId) });
}

async function completeJob(req, res) {
  const job = await jobService.completeJob(
    req.params.workerId,
    req.params.jobId,
    req.body.result || req.body
  );
  if (!job) {
    throw httpError(409, 'Job is not assigned to this worker');
  }
  await workflowService.advanceWorkflowAfterJobCompletion(job);
  res.json({ job });
}

async function failJob(req, res) {
  const job = await jobService.failJob(
    req.params.workerId,
    req.params.jobId,
    req.body.error || 'Worker reported failure'
  );
  if (!job) {
    throw httpError(409, 'Job is not assigned to this worker');
  }
  if (job.status === jobService.JOB_STATUS.FAILED) {
    await workflowService.advanceWorkflowAfterJobFailure(job);
  }
  req.app.locals.scheduler.trackJob(job);
  res.json({ job });
}

async function renewLease(req, res) {
  const job = await jobService.renewLease(
    req.params.workerId,
    req.params.jobId,
    req.app.locals.config.workerLeaseMs
  );
  if (!job) {
    throw httpError(409, 'Job is not assigned to this worker');
  }
  res.json({ job });
}

module.exports = {
  assignments,
  completeJob,
  failJob,
  getWorker,
  heartbeat,
  listWorkers,
  register,
  renewLease
};
