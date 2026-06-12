function numberFromEnv(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) ? value : fallback;
}

function loadEnv() {
  return {
    apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000/api',
    workerId: process.env.WORKER_ID || `worker-${Math.random().toString(36).slice(2, 8)}`,
    cpu: numberFromEnv('WORKER_CPU', 2),
    memory: numberFromEnv('WORKER_MEMORY', 4),
    capacity: numberFromEnv('WORKER_CAPACITY', 2),
    heartbeatEveryMs: numberFromEnv('WORKER_HEARTBEAT_MS', 5000),
    pollEveryMs: numberFromEnv('WORKER_POLL_MS', 1000),
    leaseRenewEveryMs: numberFromEnv('WORKER_LEASE_RENEW_MS', 10000)
  };
}

module.exports = { loadEnv };
