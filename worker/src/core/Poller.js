class Poller {
  constructor(client, config, processor) {
    this.client = client;
    this.config = config;
    this.processor = processor;
    this.timer = null;
    this.running = false;
  }

  start() {
    this.poll();
    this.timer = setInterval(() => this.poll(), this.config.pollEveryMs);
  }

  stop() {
    clearInterval(this.timer);
  }

  async poll() {
    if (this.running) {
      return;
    }

    this.running = true;
    try {
      const payload = await this.client.get(`/workers/${this.config.workerId}/assignments`);
      for (const job of payload.jobs || []) {
        this.processor.run(job);
      }
    } catch (error) {
      console.warn(`Assignment poll failed: ${error.message}`);
    } finally {
      this.running = false;
    }
  }
}

module.exports = { Poller };
