const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const wantsSsl =
  process.env.PGSSL === 'true' ||
  process.env.PGSSLCA ||
  process.env.PGSSLCERT ||
  (process.env.DATABASE_URL || '').includes('sslmode=require');

const sslConfig = (() => {
  if (!wantsSsl) return undefined;
  if (process.env.PGSSLCA) {
    return { ca: process.env.PGSSLCA, rejectUnauthorized: true };
  }
  if (process.env.PGSSLCERT) {
    return { ca: fs.readFileSync(path.resolve(process.env.PGSSLCERT)), rejectUnauthorized: true };
  }
  return { rejectUnauthorized: false };
})();

function cleanUrl(url) {
  if (!url) return url;
  return url.replace(/[?&]sslmode=require/, '?').replace(/\?$/, '');
}

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: cleanUrl(process.env.DATABASE_URL),
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
