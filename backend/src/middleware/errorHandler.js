const multer = require('multer');

// 404 handler for unmatched routes
function notFound(req, res, next) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

// Central error handler - converts known error types into clean JSON responses
function errorHandler(err, req, res, next) {
  console.error(err);

  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }

  // Postgres unique_violation
  if (err.code === '23505') {
    const field = err.detail && err.detail.includes('email') ? 'email' : 'admission_number';
    return res.status(409).json({ error: `A student with this ${field} already exists.` });
  }

  // Postgres check_violation / not-null / foreign key etc.
  if (err.code && err.code.startsWith('23')) {
    return res.status(400).json({ error: 'Invalid data submitted.', detail: err.detail });
  }

  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
}

module.exports = { notFound, errorHandler };
