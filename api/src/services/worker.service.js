const crypto = require('node:crypto');
const { Job, JOB_STATUS } = require('../models/Job');
const { Worker, WORKER_STATUS, serializeWorker } = require('../models/Worker');

function createId(prefix) {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
}

function positiveInteger(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Math.round(number) : fallback;
}

async function registerWorker(input = {}) {
  const id = String(input.workerId || input.id || createId('worker'));
  const worker = await Worker.findOneAndUpdate(
    { id },
    {
      $set: {
        id,
        status: WORKER_STATUS.ACTIVE,
        cpu: positiveInteger(input.cpu, 2),
        memory: positiveInteger(input.memory, 4),
        capacity: positiveInteger(input.capacity, positiveInteger(input.cpu, 2)),
        lastHeartbeat: new Date()
      },
      $setOnInsert: {
        registeredAt: new Date()
      }
    },
    { new: true, upsert: true }
  );

  return serializeWorker(worker, await countWorkerLoad(id));
}

async function heartbeat(workerId) {
  const worker = await Worker.findOneAndUpdate(
    { id: workerId },
    { $set: { status: WORKER_STATUS.ACTIVE, lastHeartbeat: new Date() } },
    { new: true }
  );
  return serializeWorker(worker, worker ? await countWorkerLoad(worker.id) : 0);
}

async function listWorkers() {
  const workers = await Worker.find().sort({ id: 1 }).lean();
  const loads = await loadMap();
  return workers.map((worker) => serializeWorker(worker, loads.get(worker.id) || 0));
}

async function getWorker(workerId) {
  const worker = await Worker.findOne({ id: workerId }).lean();
  return serializeWorker(worker, worker ? await countWorkerLoad(worker.id) : 0);
}

async function markWorkerDead(workerId) {
  const worker = await Worker.findOneAndUpdate(
    { id: workerId, status: WORKER_STATUS.ACTIVE },
    { $set: { status: WORKER_STATUS.DEAD } },
    { new: true }
  );
  return serializeWorker(worker, worker ? await countWorkerLoad(worker.id) : 0);
}

async function getExpiredWorkers(heartbeatTimeoutMs) {
  const cutoff = new Date(Date.now() - heartbeatTimeoutMs);
  const workers = await Worker.find({
    status: WORKER_STATUS.ACTIVE,
    lastHeartbeat: { $lt: cutoff }
  }).lean();
  return workers.map((worker) => serializeWorker(worker));
}

async function countWorkerLoad(workerId) {
  return Job.countDocuments({ status: JOB_STATUS.RUNNING, assignedWorker: workerId });
}

async function loadMap() {
  const loads = await Job.aggregate([
    { $match: { status: JOB_STATUS.RUNNING } },
    { $group: { _id: '$assignedWorker', count: { $sum: 1 } } }
  ]);
  return new Map(loads.map((item) => [item._id, item.count]));
}

module.exports = {
  WORKER_STATUS,
  countWorkerLoad,
  getExpiredWorkers,
  getWorker,
  heartbeat,
  listWorkers,
  markWorkerDead,
  registerWorker
};
