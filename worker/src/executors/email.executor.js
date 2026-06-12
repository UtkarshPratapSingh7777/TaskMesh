async function execute(job) {
  await sleep(Number(job.payload.durationMs) || 800);
  return {
    executor: 'email',
    message: `Email accepted for ${job.payload.tenant || 'unknown tenant'}`
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { execute };
