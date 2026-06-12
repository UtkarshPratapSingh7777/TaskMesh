const mongoose = require('mongoose');

const WORKFLOW_STATUS = Object.freeze({
  WAITING: 'WAITING',
  PENDING: 'PENDING',
  RUNNING: 'RUNNING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELED: 'CANCELED'
});

const workflowNodeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  payload: { type: mongoose.Schema.Types.Mixed, default: {} },
  priority: { type: Number, min: 0, max: 100, default: 5 },
  status: { type: String, enum: Object.values(WORKFLOW_STATUS), default: WORKFLOW_STATUS.WAITING },
  jobId: { type: String, default: '' }
}, { _id: false });

const workflowEdgeSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true }
}, { _id: false });

const workflowSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, trim: true },
  nodes: { type: [workflowNodeSchema], default: [] },
  edges: { type: [workflowEdgeSchema], default: [] },
  topologicalOrder: { type: [String], default: [] },
  status: { type: String, enum: Object.values(WORKFLOW_STATUS), default: WORKFLOW_STATUS.RUNNING, index: true }
}, {
  id: false,
  timestamps: true,
  versionKey: false
});

workflowSchema.set('toJSON', {
  transform(doc, ret) {
    delete ret._id;
    return ret;
  }
});

function serializeWorkflow(workflow) {
  if (!workflow) {
    return null;
  }
  const raw = typeof workflow.toJSON === 'function' ? workflow.toJSON() : { ...workflow };
  delete raw._id;
  return raw;
}

module.exports = {
  Workflow: mongoose.model('Workflow', workflowSchema),
  WORKFLOW_STATUS,
  serializeWorkflow
};
