const express = require('express');
const jobs = require('../controllers/job.controller');

const router = express.Router();

router.get('/', wrap(jobs.listJobs));
router.post('/', wrap(jobs.createJob));
router.get('/stats', wrap(jobs.stats));
router.post('/demo', wrap(jobs.seedDemo));
router.get('/:jobId', wrap(jobs.getJob));
router.patch('/:jobId', wrap(jobs.updateJob));
router.delete('/:jobId', wrap(jobs.deleteJob));
router.post('/:jobId/cancel', wrap(jobs.cancelJob));

function wrap(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

module.exports = router;
