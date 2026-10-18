// Centralized error handler. Must be registered last (after routes).
function errorHandler(err, req, res, _next) {
  console.error('[error]', err.message);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid id format' });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: 'Duplicate entry — this record already exists' });
  }

  return res.status(err.status || 500).json({
    message: err.expose ? err.message : 'Server error',
  });
}

module.exports = errorHandler;
