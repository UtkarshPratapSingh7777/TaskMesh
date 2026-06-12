const { Job } = require('../../models/Job');

function startJobChangeStream(scheduler) {
  try {
    const stream = Job.watch([], { fullDocument: 'updateLookup' });
    stream.on('change', (change) => {
      if (change.fullDocument) {
        scheduler.trackJob(change.fullDocument);
      }
    });
    stream.on('error', (error) => {
      console.warn(`Mongo change stream disabled: ${error.message}`);
      stream.close().catch(() => {});
    });
    return stream;
  } catch (error) {
    console.warn(`Mongo change stream unavailable: ${error.message}`);
    return null;
  }
}

module.exports = { startJobChangeStream };
