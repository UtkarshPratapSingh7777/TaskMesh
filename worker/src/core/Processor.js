const { pickExecutor } = require('../executors');

class Processor {
  constructor(client, config) {
    this.client = client;
    this.config = config;
    this.processing = new Set();
  }

  run(job) {
    if (this.processing.has(job.id)) {
      return;
    }

    this.processing.add(job.id);
    this.process(job).finally(() => this.processing.delete(job.id));
  }

  async process(job) {
    console.log(`Starting ${job.id} (${job.name})`);
    const leaseTimer = this.startLeaseRenewal(job.id);

    try {
      const result = await pickExecutor(job)(job);
      await this.client.post(`/workers/${this.config.workerId}/jobs/${job.id}/complete`, { result });
      console.log(`Completed ${job.id}`);
    } catch (error) {
      await this.client.post(`/workers/${this.config.workerId}/jobs/${job.id}/fail`, {
        error: error.message
      });
      console.warn(`Failed ${job.id}: ${error.message}`);
    } finally {
      clearInterval(leaseTimer);
    }
  }

  startLeaseRenewal(jobId) {
    return setInterval(async () => {
      try {
        await this.client.post(`/workers/${this.config.workerId}/jobs/${jobId}/lease`);
      } catch (error) {
        console.warn(`Lease renewal failed for ${jobId}: ${error.message}`);
      }
    }, this.config.leaseRenewEveryMs);
  }
}

module.exports = { Processor };
