const crypto = require('node:crypto');
const { Job, JOB_STATUS, SCHEDULABLE_STATUSES, isSchedulableJob, isTerminalJob, serializeJob } = require('../models/Job');
const { Worker, WORKER_STATUS } = require('../models/Worker');

function createId(prefix) {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
}

function coercePayload(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function coercePriority(value) {
  const priority = Number(value);
  return Number.isFinite(priority) ? Math.max(0, Math.min(100, Math.round(priority))) : 5;
}

function coerceAttempts(value) {
  const attempts = Number(value);
  return Number.isFinite(attempts) ? Math.max(1, Math.min(20, Math.round(attempts))) : 4;
}

function coerceRunAt(runAt, delaySeconds) {
  if (delaySeconds !== undefined && delaySeconds !== null && delaySeconds !== '') {
    const seconds = Number(delaySeconds);
    if (Number.isFinite(seconds)) {
      return new Date(Date.now() + seconds * 1000);
    }
  }

  if (runAt) {
    const parsed = new Date(runAt);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return new Date();
}

async function createJob(input = {}) {
  const job = await Job.create({
    id: createId('job'),
    name: String(input.name || 'Untitled job'),
    payload: coercePayload(input.payload),
    status: input.status || JOB_STATUS.PENDING,
    priority: coercePriority(input.priority),
    maxAttempts: coerceAttempts(input.maxAttempts),
    runAt: coerceRunAt(input.runAt, input.delaySeconds),
    workflowId: input.workflowId || '',
    workflowNodeId: input.workflowNodeId || ''
  });

  return serializeJob(job);
}

async function listJobs(filter = {}) {
  const query = {};
  if (filter.status) {
    query.status = String(filter.status).toUpperCase();
  }
  if (filter.workflowId) {
    query.workflowId = filter.workflowId;
  }
  const jobs = await Job.find(query).sort({ createdAt: -1 }).lean();
  return jobs.map(serializeJob);
}

async function getJob(jobId) {
  return serializeJob(await Job.findOne({ id: jobId }));
}

async function updateJob(jobId, patch = {}) {
  const job = await Job.findOne({ id: jobId });
  if (!job) {
    return null;
  }

  if (patch.name !== undefined) {
    job.name = String(patch.name);
  }
  if (patch.payload !== undefined) {
    job.payload = coercePayload(patch.payload);
  }
  if (patch.priority !== undefined) {
    job.priority = coercePriority(patch.priority);
  }
  if (patch.maxAttempts !== undefined) {
    job.maxAttempts = coerceAttempts(patch.maxAttempts);
  }
  if (patch.runAt !== undefined || patch.delaySeconds !== undefined) {
    job.runAt = coerceRunAt(patch.runAt, patch.delaySeconds);
    if ([JOB_STATUS.PENDING, JOB_STATUS.RETRYING, JOB_STATUS.READY].includes(job.status)) {
      job.status = JOB_STATUS.PENDING;
      job.assignedWorker = '';
      job.leaseExpiry = null;
    }
  }

  await job.save();
  return serializeJob(job);
}

async function deleteJob(jobId) {
  const result = await Job.deleteOne({ id: jobId });
  return result.deletedCount > 0;
}

async function cancelJob(jobId) {
  const job = await Job.findOne({ id: jobId });
  if (!job) {
    return null;
  }
  if (!isTerminalJob(job.status)) {
    job.status = JOB_STATUS.CANCELED;
    job.assignedWorker = '';
    job.leaseExpiry = null;
    await job.save();
  }
  return serializeJob(job);
}

async function markReady(jobId) {
  const job = await Job.findOneAndUpdate(
    { id: jobId, status: { $in: SCHEDULABLE_STATUSES } },
    { $set: { status: JOB_STATUS.READY, assignedWorker: '', leaseExpiry: null } },
    { new: true }
  );
  return serializeJob(job);
}

async function getSchedulableJobs(windowEnd) {
  const jobs = await Job.find({
    status: { $in: SCHEDULABLE_STATUSES },
    runAt: { $lte: windowEnd }
  }).sort({ runAt: 1, priority: -1 }).lean();
  return jobs.map(serializeJob);
}

async function getLeaseExpiredJobs(now = new Date()) {
  const jobs = await Job.find({
    status: JOB_STATUS.RUNNING,
    leaseExpiry: { $ne: null, $lte: now }
  }).lean();
  return jobs.map(serializeJob);
}

async function listAssignedJobs(workerId) {
  const jobs = await Job.find({
    status: JOB_STATUS.RUNNING,
    assignedWorker: workerId
  }).sort({ startedAt: 1 }).lean();
  return jobs.map(serializeJob);
}

async function renewLease(workerId, jobId, leaseMs) {
  const job = await Job.findOneAndUpdate(
    { id: jobId, assignedWorker: workerId, status: JOB_STATUS.RUNNING },
    { $set: { leaseExpiry: new Date(Date.now() + leaseMs) } },
    { new: true }
  );
  return serializeJob(job);
}

async function completeJob(workerId, jobId, result = {}) {
  const now = new Date();
  const job = await Job.findOneAndUpdate(
    { id: jobId, assignedWorker: workerId, status: JOB_STATUS.RUNNING },
    {
      $set: {
        status: JOB_STATUS.COMPLETED,
        result: coercePayload(result),
        error: '',
        leaseExpiry: null,
        completedAt: now
      }
    },
    { new: true }
  );
  return serializeJob(job);
}

async function failJob(workerId, jobId, error = 'Worker reported failure') {
  const job = await Job.findOne({ id: jobId, assignedWorker: workerId, status: JOB_STATUS.RUNNING });
  return retryOrFail(job, error);
}

async function retryOrFail(jobOrId, error = 'Job failed') {
  const job = typeof jobOrId === 'string'
    ? await Job.findOne({ id: jobOrId })
    : jobOrId && typeof jobOrId.save === 'function'
      ? jobOrId
      : await Job.findOne({ id: jobOrId && jobOrId.id });

  if (!job) {
    return null;
  }

  job.error = String(error);
  job.assignedWorker = '';
  job.leaseExpiry = null;

  if (job.attempts < job.maxAttempts) {
    job.status = JOB_STATUS.RETRYING;
    job.runAt = new Date(Date.now() + exponentialBackoffMs(job.attempts));
    job.completedAt = null;
  } else {
    job.status = JOB_STATUS.FAILED;
    job.completedAt = new Date();
  }

  await job.save();
  return serializeJob(job);
}

async function getStats() {
  const counts = await Job.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  const jobs = counts.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  const [totalJobs, activeWorkers, deadWorkers, runningJobs, completedJobs, failedJobs] = await Promise.all([
    Job.countDocuments(),
    Worker.countDocuments({ status: WORKER_STATUS.ACTIVE }),
    Worker.countDocuments({ status: WORKER_STATUS.DEAD }),
    Job.countDocuments({ status: JOB_STATUS.RUNNING }),
    Job.countDocuments({ status: JOB_STATUS.COMPLETED }),
    Job.countDocuments({ status: JOB_STATUS.FAILED })
  ]);

  const terminal = completedJobs + failedJobs;
  return {
    jobs,
    totalJobs,
    activeWorkers,
    deadWorkers,
    runningJobs,
    failureRate: terminal ? Number((failedJobs / terminal).toFixed(2)) : 0,
    queueDepth: (jobs.PENDING || 0) + (jobs.RETRYING || 0) + (jobs.READY || 0)
  };
}

async function seedDemoJobs() {
  const now = Date.now();
  const jobs = await Promise.all([
    createJob({
      name: 'Send billing emails',
      payload: { kind: 'email', tenant: 'acme' },
      priority: 9,
      runAt: new Date(now + 3000)
    }),
    createJob({
      name: 'Generate usage report',
      payload: { kind: 'report', report: 'monthly-usage' },
      priority: 6,
      runAt: new Date(now + 6000)
    }),
    createJob({
      name: 'Image transformation batch',
      payload: { durationMs: 1800 },
      priority: 3,
      runAt: new Date(now + 9000)
    })
  ]);
  return { jobs };
}

function exponentialBackoffMs(attemptNumber, baseMs = 30_000) {
  const exponent = Math.max(0, Number(attemptNumber) - 1);
  return baseMs * (2 ** exponent);
}

module.exports = {
  JOB_STATUS,
  cancelJob,
  completeJob,
  createJob,
  deleteJob,
  failJob,
  getJob,
  getLeaseExpiredJobs,
  getSchedulableJobs,
  getStats,
  isSchedulableJob,
  isTerminalJob,
  listAssignedJobs,
  listJobs,
  markReady,
  renewLease,
  retryOrFail,
  seedDemoJobs,
  updateJob
};
