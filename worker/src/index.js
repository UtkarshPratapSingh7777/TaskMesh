const { loadEnv } = require('./config/env');
const { Poller } = require('./core/Poller');
const { startHeartbeat } = require('./core/Heartbeat');
const { Processor } = require('./core/Processor');
const { createApiClient } = require('./network/apiClient');

async function main() {
  const config = loadEnv();
  const client = createApiClient(config.apiBaseUrl);

  await client.post('/workers/register', {
    workerId: config.workerId,
    cpu: config.cpu,
    memory: config.memory,
    capacity: config.capacity
  });

  console.log(`Worker ${config.workerId} registered against ${config.apiBaseUrl}`);
  const heartbeatTimer = startHeartbeat(client, config.workerId, config.heartbeatEveryMs);
  const processor = new Processor(client, config);
  const poller = new Poller(client, config, processor);
  poller.start();

  function shutdown() {
    clearInterval(heartbeatTimer);
    poller.stop();
    process.exit(0);
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
