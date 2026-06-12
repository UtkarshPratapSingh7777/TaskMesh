const mongoose = require('mongoose');

const WORKER_STATUS = Object.freeze({
  ACTIVE: 'ACTIVE',
  DEAD: 'DEAD'
});

const workerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  status: { type: String, enum: Object.values(WORKER_STATUS), default: WORKER_STATUS.ACTIVE, index: true },
  cpu: { type: Number, min: 1, default: 2 },
  memory: { type: Number, min: 1, default: 4 },
  capacity: { type: Number, min: 1, default: 2 },
  lastHeartbeat: { type: Date, default: Date.now, index: true },
  registeredAt: { type: Date, default: Date.now }
}, {
  id: false,
  timestamps: true,
  versionKey: false
});

workerSchema.set('toJSON', {
  transform(doc, ret) {
    delete ret._id;
    return ret;
  }
});

function serializeWorker(worker, load = 0) {
  if (!worker) {
    return null;
  }
  const raw = typeof worker.toJSON === 'function' ? worker.toJSON() : { ...worker };
  delete raw._id;
  raw.load = load;
  return raw;
}

module.exports = {
  Worker: mongoose.model('Worker', workerSchema),
  WORKER_STATUS,
  serializeWorker
};
