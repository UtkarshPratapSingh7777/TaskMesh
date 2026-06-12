function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function notFound(req, res) {
  res.status(404).json({ error: 'Route not found' });
}

function errorMiddleware(error, req, res, next) {
  const status = error.status || 500;
  if (status >= 500) {
    console.error(error);
  }
  res.status(status).json({ error: error.message || 'Internal server error' });
}

module.exports = {
  errorMiddleware,
  httpError,
  notFound
};
