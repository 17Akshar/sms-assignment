/**
 * Inserts a handful of sample students for local development / demos.
 * Usage: npm run seed
 */
require('dotenv').config();
const pool = require('../config/db');
const { generateAdmissionNumber } = require('../utils/admissionNumber');

const samples = [
  { name: 'Aarav Sharma', course: 'B.Sc. Computer Science', year: 2, date_of_birth: '2004-03-12', email: 'aarav.sharma@example.com', mobile_number: '9876543210', gender: 'Male', address: 'Mumbai, Maharashtra' },
  { name: 'Isha Patel', course: 'B.Com', year: 1, date_of_birth: '2005-07-22', email: 'isha.patel@example.com', mobile_number: '9876543211', gender: 'Female', address: 'Ahmedabad, Gujarat' },
  { name: 'Rohan Verma', course: 'B.Tech Electronics', year: 3, date_of_birth: '2003-11-05', email: 'rohan.verma@example.com', mobile_number: '9876543212', gender: 'Male', address: 'Pune, Maharashtra' },
];

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const s of samples) {
      const admissionNumber = await generateAdmissionNumber(client);
      await client.query(
        `INSERT INTO students
          (admission_number, name, course, year, date_of_birth, email, mobile_number, gender, address)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (email) DO NOTHING`,
        [admissionNumber, s.name, s.course, s.year, s.date_of_birth, s.email, s.mobile_number, s.gender, s.address]
      );
    }
    await client.query('COMMIT');
    console.log('Seed data inserted.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seeding failed:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
