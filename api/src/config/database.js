const mongoose = require('mongoose');

async function connectDatabase(mongoUrl) {
  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUrl);
  return mongoose.connection;
}

module.exports = { connectDatabase };
