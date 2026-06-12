async function execute(job) {
  await sleep(Number(job.payload.durationMs) || 1200);
  return {
    executor: 'report',
    message: `Report generated for ${job.payload.report || 'ad hoc report'}`
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { execute };
