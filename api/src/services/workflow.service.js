const crypto = require('node:crypto');
const { Workflow, WORKFLOW_STATUS, serializeWorkflow } = require('../models/Workflow');
const { JOB_STATUS } = require('../models/Job');
const { hasCycle } = require('../engine/graph/CycleDetector');
const { topologicalSort } = require('../engine/graph/TopoSort');
const { cancelJob, createJob, listJobs } = require('./job.service');

function createId(prefix) {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
}

function normalizePayload(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function normalizePriority(value) {
  const priority = Number(value);
  return Number.isFinite(priority) ? Math.max(0, Math.min(100, Math.round(priority))) : 5;
}

function normalizeNodes(nodes) {
  if (!Array.isArray(nodes) || nodes.length === 0) {
    throw new Error('Workflow requires at least one node');
  }

  return nodes.map((node, index) => {
    if (typeof node === 'string') {
      return { id: node, name: node, payload: {}, priority: 5 };
    }
    const fallbackId = node.name ? slugify(node.name) : `task_${index + 1}`;
    return {
      id: String(node.id || fallbackId),
      name: String(node.name || node.id || fallbackId),
      payload: normalizePayload(node.payload),
      priority: normalizePriority(node.priority)
    };
  });
}

function normalizeEdges(edges) {
  if (!Array.isArray(edges)) {
    return [];
  }
  return edges.map((edge) => Array.isArray(edge)
    ? { from: String(edge[0]), to: String(edge[1]) }
    : { from: String(edge.from), to: String(edge.to) });
}

function validateGraph(nodes, edges) {
  const ids = new Set();
  for (const node of nodes) {
    if (!node.id) {
      throw new Error('Workflow node is missing an id');
    }
    if (ids.has(node.id)) {
      throw new Error(`Duplicate workflow node id: ${node.id}`);
    }
    ids.add(node.id);
  }

  for (const edge of edges) {
    if (!ids.has(edge.from) || !ids.has(edge.to)) {
      throw new Error(`Invalid edge ${edge.from} -> ${edge.to}`);
    }
  }

  if (hasCycle(nodes, edges)) {
    throw new Error('Workflow graph contains a cycle');
  }
}

async function createWorkflow(input = {}) {
  const nodes = normalizeNodes(input.nodes);
  const edges = normalizeEdges(input.edges);
  validateGraph(nodes, edges);

  const rootIds = new Set(getRootNodeIds(nodes, edges));
  const workflow = await Workflow.create({
    id: createId('wf'),
    name: String(input.name || 'Untitled workflow'),
    nodes: nodes.map((node) => ({
      ...node,
      status: rootIds.has(node.id) ? WORKFLOW_STATUS.PENDING : WORKFLOW_STATUS.WAITING,
      jobId: ''
    })),
    edges,
    topologicalOrder: topologicalSort(nodes, edges),
    status: WORKFLOW_STATUS.RUNNING
  });

  for (const node of workflow.nodes.filter((item) => rootIds.has(item.id))) {
    const job = await createWorkflowJob(workflow, node, input.runAt);
    node.jobId = job.id;
  }

  await workflow.save();
  return serializeWorkflow(workflow);
}

async function listWorkflows() {
  const workflows = await Workflow.find().sort({ createdAt: -1 }).lean();
  return workflows.map(serializeWorkflow);
}

async function getWorkflow(workflowId) {
  return serializeWorkflow(await Workflow.findOne({ id: workflowId }));
}

async function deleteWorkflow(workflowId) {
  const workflow = await Workflow.findOne({ id: workflowId });
  if (!workflow) {
    return false;
  }

  const jobs = await listJobs({ workflowId });
  for (const job of jobs) {
    if (![JOB_STATUS.COMPLETED, JOB_STATUS.FAILED, JOB_STATUS.CANCELED].includes(job.status)) {
      await cancelJob(job.id);
    }
  }

  await Workflow.deleteOne({ id: workflowId });
  return true;
}

async function advanceWorkflowAfterJobCompletion(job) {
  if (!job || !job.workflowId || !job.workflowNodeId) {
    return null;
  }

  const workflow = await Workflow.findOne({ id: job.workflowId });
  if (!workflow) {
    return null;
  }

  const node = workflow.nodes.find((item) => item.id === job.workflowNodeId);
  if (!node) {
    return serializeWorkflow(workflow);
  }

  node.status = WORKFLOW_STATUS.COMPLETED;
  node.jobId = job.id;

  for (const childId of getChildNodeIds(node.id, workflow.edges)) {
    const child = workflow.nodes.find((item) => item.id === childId);
    if (!child || child.jobId || child.status !== WORKFLOW_STATUS.WAITING) {
      continue;
    }

    const parents = getParentNodeIds(child.id, workflow.edges);
    const parentsDone = parents.every((parentId) => {
      const parent = workflow.nodes.find((item) => item.id === parentId);
      return parent && parent.status === WORKFLOW_STATUS.COMPLETED;
    });

    if (parentsDone) {
      child.status = WORKFLOW_STATUS.PENDING;
      const childJob = await createWorkflowJob(workflow, child, new Date());
      child.jobId = childJob.id;
    }
  }

  workflow.status = workflow.nodes.every((item) => item.status === WORKFLOW_STATUS.COMPLETED)
    ? WORKFLOW_STATUS.COMPLETED
    : WORKFLOW_STATUS.RUNNING;

  await workflow.save();
  return serializeWorkflow(workflow);
}

async function advanceWorkflowAfterJobFailure(job) {
  if (!job || job.status !== JOB_STATUS.FAILED || !job.workflowId || !job.workflowNodeId) {
    return null;
  }

  const workflow = await Workflow.findOne({ id: job.workflowId });
  if (!workflow) {
    return null;
  }

  const node = workflow.nodes.find((item) => item.id === job.workflowNodeId);
  if (node) {
    node.status = WORKFLOW_STATUS.FAILED;
    node.jobId = job.id;
  }
  workflow.status = WORKFLOW_STATUS.FAILED;
  await workflow.save();
  return serializeWorkflow(workflow);
}

async function createWorkflowJob(workflow, node, runAt) {
  return createJob({
    name: `${workflow.name}: ${node.name}`,
    payload: node.payload,
    priority: node.priority,
    runAt,
    workflowId: workflow.id,
    workflowNodeId: node.id
  });
}

function getRootNodeIds(nodes, edges) {
  const inbound = new Set(edges.map((edge) => edge.to));
  return nodes.filter((node) => !inbound.has(node.id)).map((node) => node.id);
}

function getChildNodeIds(nodeId, edges) {
  return edges.filter((edge) => edge.from === nodeId).map((edge) => edge.to);
}

function getParentNodeIds(nodeId, edges) {
  return edges.filter((edge) => edge.to === nodeId).map((edge) => edge.from);
}

function slugify(value) {
  const slug = String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return slug || 'task';
}

module.exports = {
  advanceWorkflowAfterJobCompletion,
  advanceWorkflowAfterJobFailure,
  createWorkflow,
  deleteWorkflow,
  getWorkflow,
  listWorkflows
};
