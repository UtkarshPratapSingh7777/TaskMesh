function startHeartbeat(client, workerId, everyMs) {
  async function beat() {
    try {
      await client.post('/workers/heartbeat', { workerId });
    } catch (error) {
      console.warn(`Heartbeat failed: ${error.message}`);
    }
  }

  beat();
  return setInterval(beat, everyMs);
}

module.exports = { startHeartbeat };
