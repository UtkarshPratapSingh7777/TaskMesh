const express = require('express');
const workers = require('../controllers/worker.controller');

const router = express.Router();

router.get('/', wrap(workers.listWorkers));
router.post('/register', wrap(workers.register));
router.post('/heartbeat', wrap(workers.heartbeat));
router.get('/:workerId', wrap(workers.getWorker));
router.get('/:workerId/assignments', wrap(workers.assignments));
router.post('/:workerId/jobs/:jobId/complete', wrap(workers.completeJob));
router.post('/:workerId/jobs/:jobId/fail', wrap(workers.failJob));
router.post('/:workerId/jobs/:jobId/lease', wrap(workers.renewLease));

function wrap(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

module.exports = router;
