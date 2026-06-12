const mongoose = require('mongoose');

const JOB_STATUS = Object.freeze({
  PENDING: 'PENDING',
  READY: 'READY',
  RUNNING: 'RUNNING',
  RETRYING: 'RETRYING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELED: 'CANCELED'
});

const SCHEDULABLE_STATUSES = [JOB_STATUS.PENDING, JOB_STATUS.RETRYING];
const TERMINAL_STATUSES = [JOB_STATUS.COMPLETED, JOB_STATUS.FAILED, JOB_STATUS.CANCELED];

const jobSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, trim: true },
  payload: { type: mongoose.Schema.Types.Mixed, default: {} },
  status: { type: String, enum: Object.values(JOB_STATUS), default: JOB_STATUS.PENDING, index: true },
  priority: { type: Number, min: 0, max: 100, default: 5, index: true },
  attempts: { type: Number, min: 0, default: 0 },
  maxAttempts: { type: Number, min: 1, max: 20, default: 4 },
  assignedWorker: { type: String, default: '', index: true },
  runAt: { type: Date, default: Date.now, index: true },
  leaseExpiry: { type: Date, default: null, index: true },
  workflowId: { type: String, default: '', index: true },
  workflowNodeId: { type: String, default: '' },
  result: { type: mongoose.Schema.Types.Mixed, default: null },
  error: { type: String, default: '' },
  startedAt: { type: Date, default: null },
  completedAt: { type: Date, default: null }
}, {
  id: false,
  timestamps: true,
  versionKey: false
});

jobSchema.index({ status: 1, runAt: 1 });

jobSchema.set('toJSON', {
  transform(doc, ret) {
    delete ret._id;
    return ret;
  }
});

function isSchedulableJob(status) {
  return SCHEDULABLE_STATUSES.includes(status);
}

function isTerminalJob(status) {
  return TERMINAL_STATUSES.includes(status);
}

function serializeJob(job) {
  if (!job) {
    return null;
  }
  const raw = typeof job.toJSON === 'function' ? job.toJSON() : { ...job };
  delete raw._id;
  return raw;
}

module.exports = {
  Job: mongoose.model('Job', jobSchema),
  JOB_STATUS,
  SCHEDULABLE_STATUSES,
  TERMINAL_STATUSES,
  isSchedulableJob,
  isTerminalJob,
  serializeJob
};
