const workflowService = require('../../services/workflow.service');
const { httpError } = require('../middlewares/error.middleware');

async function listWorkflows(req, res) {
  res.json({ workflows: await workflowService.listWorkflows() });
}

async function createWorkflow(req, res) {
  const workflow = await workflowService.createWorkflow(req.body);
  await req.app.locals.scheduler.preloadWindow();
  res.status(201).json({ workflow });
}

async function getWorkflow(req, res) {
  const workflow = await workflowService.getWorkflow(req.params.workflowId);
  if (!workflow) {
    throw httpError(404, 'Workflow not found');
  }
  res.json({ workflow });
}

async function deleteWorkflow(req, res) {
  const deleted = await workflowService.deleteWorkflow(req.params.workflowId);
  if (!deleted) {
    throw httpError(404, 'Workflow not found');
  }
  await req.app.locals.scheduler.preloadWindow();
  res.json({ ok: true });
}

module.exports = {
  createWorkflow,
  deleteWorkflow,
  getWorkflow,
  listWorkflows
};
