const express = require('express');
const workflows = require('../controllers/workflow.controller');

const router = express.Router();

router.get('/', wrap(workflows.listWorkflows));
router.post('/', wrap(workflows.createWorkflow));
router.get('/:workflowId', wrap(workflows.getWorkflow));
router.delete('/:workflowId', wrap(workflows.deleteWorkflow));

function wrap(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

module.exports = router;
