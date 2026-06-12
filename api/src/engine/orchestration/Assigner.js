const { Job, JOB_STATUS, serializeJob } = require('../../models/Job');
const { Worker, WORKER_STATUS } = require('../../models/Worker');

async function findAvailableWorker(heartbeatTimeoutMs) {
  const cutoff = new Date(Date.now() - heartbeatTimeoutMs);
  const workers = await Worker.find({
    status: WORKER_STATUS.ACTIVE,
    lastHeartbeat: { $gte: cutoff }
  }).sort({ id: 1 }).lean();

  const candidates = [];
  for (const worker of workers) {
    const load = await Job.countDocuments({
      status: JOB_STATUS.RUNNING,
      assignedWorker: worker.id
    });

    if (load < worker.capacity) {
      candidates.push({ ...worker, load });
    }
  }

  candidates.sort((a, b) => {
    const utilization = (a.load / a.capacity) - (b.load / b.capacity);
    return utilization || a.id.localeCompare(b.id);
  });

  return candidates[0] || null;
}

async function assignJob(jobId, workerId, leaseMs) {
  const now = new Date();
  const job = await Job.findOneAndUpdate(
    { id: jobId, status: JOB_STATUS.READY },
    {
      $set: {
        status: JOB_STATUS.RUNNING,
        assignedWorker: workerId,
        leaseExpiry: new Date(now.getTime() + leaseMs),
        startedAt: now
      },
      $inc: { attempts: 1 }
    },
    { new: true }
  );

  return serializeJob(job);
}

module.exports = {
  assignJob,
  findAvailableWorker
};
