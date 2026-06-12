const { execute: executeEmail } = require('./email.executor');
const { execute: executeReport } = require('./report.executor');

function pickExecutor(job) {
  const kind = job.payload && job.payload.kind;
  if (kind === 'email') {
    return executeEmail;
  }
  if (kind === 'report') {
    return executeReport;
  }
  return executeDefault;
}

async function executeDefault(job) {
  const durationMs = Number(job.payload && job.payload.durationMs) || 1000;
  await new Promise((resolve) => setTimeout(resolve, durationMs));
  if (job.payload && job.payload.fail === true) {
    throw new Error('Payload requested failure');
  }
  return {
    executor: 'default',
    message: 'Job completed',
    durationMs
  };
}

module.exports = { pickExecutor };
