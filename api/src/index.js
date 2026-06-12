const express = require('express');
const { connectDatabase } = require('./config/database');
const { corsMiddleware } = require('./api/middlewares/cors.middleware');
const { errorMiddleware, notFound } = require('./api/middlewares/error.middleware');
const jobRoutes = require('./api/routes/job.routes');
const workerRoutes = require('./api/routes/worker.routes');
const workflowRoutes = require('./api/routes/workflow.routes');
const { SchedulerLoop } = require('./engine/orchestration/SchedulerLoop');

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  mongoUrl: process.env.MONGO_URL || 'mongodb://localhost:27017/flowforge',
  workerLeaseMs: Number(process.env.WORKER_LEASE_MS || 30_000),
  scheduler: {
    windowMs: Number(process.env.SCHEDULER_WINDOW_MS || 60_000),
    preloadEveryMs: Number(process.env.SCHEDULER_PRELOAD_MS || 5_000),
    recoveryEveryMs: Number(process.env.SCHEDULER_RECOVERY_MS || 10_000),
    tickEveryMs: Number(process.env.SCHEDULER_TICK_MS || 500),
    heartbeatTimeoutMs: Number(process.env.WORKER_HEARTBEAT_TIMEOUT_MS || 15_000),
    leaseMs: Number(process.env.WORKER_LEASE_MS || 30_000)
  }
};

async function main() {
  await connectDatabase(config.mongoUrl);

  const app = express();
  const scheduler = new SchedulerLoop(config.scheduler);
  app.locals.scheduler = scheduler;
  app.locals.config = config;

  app.use(corsMiddleware);
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (req, res) => {
    res.json({
      ok: true,
      env: config.nodeEnv,
      scheduler: scheduler.health()
    });
  });
  app.use('/api/jobs', jobRoutes);
  app.use('/api/workers', workerRoutes);
  app.use('/api/workflows', workflowRoutes);
  app.use(notFound);
  app.use(errorMiddleware);

  scheduler.start();
  const server = app.listen(config.port, () => {
    console.log(`FlowForge API listening on http://localhost:${config.port}`);
  });

  function shutdown() {
    scheduler.stop();
    server.close(() => process.exit(0));
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
