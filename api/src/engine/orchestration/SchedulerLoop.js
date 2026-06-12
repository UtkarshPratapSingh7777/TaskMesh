const { MinHeap } = require('../collections/MinHeap');
const { MaxHeap } = require('../collections/MaxHeap');
const { JOB_STATUS } = require('../../models/Job');
const jobService = require('../../services/job.service');
const workerService = require('../../services/worker.service');
const workflowService = require('../../services/workflow.service');
const { assignJob, findAvailableWorker } = require('./Assigner');
const { startJobChangeStream } = require('./ChangeStream');

class SchedulerLoop {
  constructor(options = {}) {
    this.windowMs = Number(options.windowMs || process.env.SCHEDULER_WINDOW_MS || 60_000);
    this.preloadEveryMs = Number(options.preloadEveryMs || process.env.SCHEDULER_PRELOAD_MS || 5_000);
    this.recoveryEveryMs = Number(options.recoveryEveryMs || process.env.SCHEDULER_RECOVERY_MS || 10_000);
    this.tickEveryMs = Number(options.tickEveryMs || process.env.SCHEDULER_TICK_MS || 500);
    this.heartbeatTimeoutMs = Number(options.heartbeatTimeoutMs || process.env.WORKER_HEARTBEAT_TIMEOUT_MS || 15_000);
    this.leaseMs = Number(options.leaseMs || process.env.WORKER_LEASE_MS || 30_000);
    this.started = false;
    this.timers = [];
    this.changeStream = null;
    this.delayIds = new Set();
    this.readyIds = new Set();
    this.delayQueue = new MinHeap(compareDelayedJobs);
    this.readyQueue = new MaxHeap(compareReadyJobs);
  }

  start() {
    if (this.started) {
      return;
    }

    this.started = true;
    this.changeStream = startJobChangeStream(this);
    this.runSafely(() => this.preloadWindow());
    this.runSafely(() => this.recoverExpiredLeases());
    this.every(this.preloadEveryMs, () => this.preloadWindow());
    this.every(this.tickEveryMs, () => this.processDelayQueue());
    this.every(this.tickEveryMs, () => this.assignReadyJobs());
    this.every(this.recoveryEveryMs, () => this.recoverExpiredLeases());
    this.every(this.recoveryEveryMs, () => this.detectDeadWorkers());
  }

  stop() {
    for (const timer of this.timers) {
      clearInterval(timer);
    }
    this.timers = [];
    this.started = false;
    if (this.changeStream) {
      this.changeStream.close().catch(() => {});
      this.changeStream = null;
    }
  }

  health() {
    return {
      started: this.started,
      delayQueueDepth: this.delayQueue.size(),
      readyQueueDepth: this.readyQueue.size(),
      windowMs: this.windowMs,
      leaseMs: this.leaseMs
    };
  }

  async preloadWindow() {
    const jobs = await jobService.getSchedulableJobs(new Date(Date.now() + this.windowMs));
    for (const job of jobs) {
      this.trackJob(job);
    }
  }

  async processDelayQueue() {
    while (this.delayQueue.size() > 0) {
      const next = this.delayQueue.peek();
      if (new Date(next.runAt).getTime() > Date.now()) {
        break;
      }

      this.delayQueue.extract();
      this.delayIds.delete(next.id);
      const ready = await jobService.markReady(next.id);
      if (ready) {
        this.trackJob(ready);
      }
    }
  }

  async assignReadyJobs() {
    while (this.readyQueue.size() > 0) {
      const worker = await findAvailableWorker(this.heartbeatTimeoutMs);
      if (!worker) {
        break;
      }

      const next = this.readyQueue.extract();
      this.readyIds.delete(next.id);
      const assigned = await assignJob(next.id, worker.id, this.leaseMs);
      if (assigned && assigned.status === JOB_STATUS.RUNNING) {
        this.removeJob(assigned.id);
      }
    }
  }

  async recoverExpiredLeases() {
    const expired = await jobService.getLeaseExpiredJobs(new Date());
    for (const job of expired) {
      const updated = await jobService.retryOrFail(job.id, 'Lease expired');
      if (updated && updated.status === JOB_STATUS.FAILED) {
        await workflowService.advanceWorkflowAfterJobFailure(updated);
      }
    
      if (updated) {
        this.trackJob(updated);
      }
    }
  }

  async detectDeadWorkers() {
    const workers = await workerService.getExpiredWorkers(this.heartbeatTimeoutMs);
    for (const worker of workers) {
      await workerService.markWorkerDead(worker.id);
      const jobs = await jobService.listAssignedJobs(worker.id);
      for (const job of jobs) {
        const updated = await jobService.retryOrFail(job.id, 'Worker heartbeat expired');
        if (updated && updated.status === JOB_STATUS.FAILED) {
          await workflowService.advanceWorkflowAfterJobFailure(updated);
        }
        if (updated) {
          this.trackJob(updated);
        }
      }
    }
  }

  trackJob(job) {
    if (!job || !job.id) {
      return;
    }

    if (job.status === JOB_STATUS.READY) {
      this.removeFromDelay(job.id);
      this.insertReady(job);
      return;
    }

    if ([JOB_STATUS.PENDING, JOB_STATUS.RETRYING].includes(job.status)) {
      this.removeFromReady(job.id);
      if (new Date(job.runAt).getTime() <= Date.now() + this.windowMs) {
        this.insertDelayed(job);
      }
      return;
    }

    this.removeJob(job.id);
  }

  removeJob(jobId) {
    this.removeFromDelay(jobId);
    this.removeFromReady(jobId);
  }

  insertDelayed(job) {
    this.removeFromDelay(job.id);
    this.delayQueue.insert(snapshot(job));
    this.delayIds.add(job.id);
  }

  insertReady(job) {
    this.removeFromReady(job.id);
    this.readyQueue.insert(snapshot(job));
    this.readyIds.add(job.id);
  }

  removeFromDelay(jobId) {
    if (this.delayIds.has(jobId)) {
      this.delayQueue.remove((item) => item.id === jobId);
      this.delayIds.delete(jobId);
    }
  }

  removeFromReady(jobId) {
    if (this.readyIds.has(jobId)) {
      this.readyQueue.remove((item) => item.id === jobId);
      this.readyIds.delete(jobId);
    }
  }

  every(ms, task) {
    let running = false;
    const timer = setInterval(async () => {
      if (running) {
        return;
      }
      running = true;
      try {
        await task();
      } catch (error) {
        console.error(error);
      } finally {
        running = false;
      }
    }, ms);
    this.timers.push(timer);
  }

  async runSafely(task) {
    try {
      await task();
    } catch (error) {
      console.error(error);
    }
  }
}

function snapshot(job) {
  return {
    id: job.id,
    name: job.name,
    priority: Number(job.priority || 0),
    runAt: job.runAt,
    status: job.status
  };
}

function compareDelayedJobs(a, b) {
  const runDiff = new Date(a.runAt).getTime() - new Date(b.runAt).getTime();
  return runDiff || b.priority - a.priority || a.id.localeCompare(b.id);
}

function compareReadyJobs(a, b) {
  const priorityDiff = a.priority - b.priority;
  const runDiff = new Date(b.runAt).getTime() - new Date(a.runAt).getTime();
  return priorityDiff || runDiff || b.id.localeCompare(a.id);
}

module.exports = { SchedulerLoop };
