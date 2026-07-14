const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const sslConfig = (() => {
  // CA certificate as inline string (works on Vercel serverless)
  if (process.env.PGSSLCA) {
    return { ca: process.env.PGSSLCA, rejectUnauthorized: true };
  }
  // CA certificate from file (local dev only)
  if (process.env.PGSSLCERT) {
    return { ca: fs.readFileSync(path.resolve(process.env.PGSSLCERT)), rejectUnauthorized: true };
  }
  // Quick mode: skip certificate verification
  if (process.env.PGSSL === 'true' || process.env.DATABASE_URL?.includes('sslmode=require')) {
    return { rejectUnauthorized: false };
  }
  return undefined;
})();

// Supports either a single DATABASE_URL or discrete PG* env vars.
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ...(sslConfig && { ssl: sslConfig }),
    })
  : new Pool({
      host: process.env.PGHOST || 'localhost',
      port: Number(process.env.PGPORT) || 5432,
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'postgres',
      database: process.env.PGDATABASE || 'student_management',
      ...(sslConfig && { ssl: sslConfig }),
    });

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err);
});

module.exports = pool;
