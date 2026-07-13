/**
 * Generates a unique, auto-incrementing admission number of the form
 * ADM-<year>-<4 digit sequence>, e.g. ADM-2026-0007.
 *
 * The sequence is tracked per calendar year in the admission_counters table
 * and incremented atomically inside the caller's transaction (row lock via
 * UPSERT ... RETURNING), so concurrent inserts never produce duplicates.
 *
 * @param {import('pg').PoolClient} client - an active client, ideally inside a transaction
 * @returns {Promise<string>} the generated admission number
 */
async function generateAdmissionNumber(client) {
  const year = new Date().getFullYear();

  const { rows } = await client.query(
    `INSERT INTO admission_counters (admission_year, last_sequence)
     VALUES ($1, 1)
     ON CONFLICT (admission_year)
     DO UPDATE SET last_sequence = admission_counters.last_sequence + 1
     RETURNING last_sequence`,
    [year]
  );

  const sequence = rows[0].last_sequence;
  const padded = String(sequence).padStart(4, '0');
  return `ADM-${year}-${padded}`;
}

module.exports = { generateAdmissionNumber };
