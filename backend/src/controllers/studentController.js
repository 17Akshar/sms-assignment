const fs = require('fs');
const path = require('path');
const pool = require('../config/db');
const { generateAdmissionNumber } = require('../utils/admissionNumber');
const { uploadDir } = require('../middleware/upload');

const SORTABLE_COLUMNS = new Set(['name', 'course', 'year', 'created_at', 'admission_number']);

function toPublicStudent(row, req) {
  if (!row) return row;
  return {
    ...row,
    photo_url: row.photo_path
      ? `${req.protocol}://${req.get('host')}/uploads/${row.photo_path}`
      : null,
  };
}

async function logActivity(client, action, studentId, details) {
  await client.query(
    `INSERT INTO activity_logs (action, student_id, details) VALUES ($1, $2, $3)`,
    [action, studentId, details ? JSON.stringify(details) : null]
  );
}

// GET /students - list with pagination, search, filter, sort
async function getStudents(req, res, next) {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const course = req.query.course || '';
    const year = req.query.year || '';
    const sortBy = SORTABLE_COLUMNS.has(req.query.sortBy) ? req.query.sortBy : 'created_at';
    const sortDir = req.query.sortDir === 'asc' ? 'ASC' : 'DESC';

    const conditions = [];
    const params = [];

    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      conditions.push(
        `(LOWER(name) LIKE $${params.length} OR LOWER(email) LIKE $${params.length} OR LOWER(admission_number) LIKE $${params.length})`
      );
    }
    if (course) {
      params.push(course);
      conditions.push(`course = $${params.length}`);
    }
    if (year) {
      params.push(year);
      conditions.push(`year = $${params.length}`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total FROM students ${whereClause}`,
      params
    );
    const total = countResult.rows[0].total;

    params.push(limit);
    params.push(offset);
    const dataResult = await pool.query(
      `SELECT * FROM students ${whereClause}
       ORDER BY ${sortBy} ${sortDir}
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json({
      data: dataResult.rows.map((r) => toPublicStudent(r, req)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (err) {
    next(err);
  }
}

// GET /students/:id
async function getStudentById(req, res, next) {
  try {
    const { rows } = await pool.query('SELECT * FROM students WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Student not found' });
    res.json({ data: toPublicStudent(rows[0], req) });
  } catch (err) {
    next(err);
  }
}

// POST /students
async function createStudent(req, res, next) {
  const client = await pool.connect();
  try {
    const { name, course, year, date_of_birth, email, mobile_number, gender, address } = req.body;
    const photoPath = req.file ? req.file.filename : null;

    await client.query('BEGIN');
    const admissionNumber = await generateAdmissionNumber(client);

    const { rows } = await client.query(
      `INSERT INTO students
        (admission_number, name, course, year, date_of_birth, email, mobile_number, gender, address, photo_path)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [admissionNumber, name, course, year, date_of_birth, email, mobile_number, gender, address, photoPath]
    );

    await logActivity(client, 'CREATE', rows[0].id, { admission_number: admissionNumber });
    await client.query('COMMIT');

    res.status(201).json({ data: toPublicStudent(rows[0], req) });
  } catch (err) {
    await client.query('ROLLBACK');
    // Clean up uploaded file if the DB insert failed
    if (req.file) fs.unlink(path.join(uploadDir, req.file.filename), () => {});
    next(err);
  } finally {
    client.release();
  }
}

// PUT /students/:id
async function updateStudent(req, res, next) {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { name, course, year, date_of_birth, email, mobile_number, gender, address } = req.body;

    const existing = await client.query('SELECT * FROM students WHERE id = $1', [id]);
    if (!existing.rows.length) {
      if (req.file) fs.unlink(path.join(uploadDir, req.file.filename), () => {});
      return res.status(404).json({ error: 'Student not found' });
    }

    const newPhotoPath = req.file ? req.file.filename : existing.rows[0].photo_path;

    await client.query('BEGIN');
    const { rows } = await client.query(
      `UPDATE students SET
        name = $1, course = $2, year = $3, date_of_birth = $4,
        email = $5, mobile_number = $6, gender = $7, address = $8, photo_path = $9
       WHERE id = $10
       RETURNING *`,
      [name, course, year, date_of_birth, email, mobile_number, gender, address, newPhotoPath, id]
    );
    await logActivity(client, 'UPDATE', id, { fields: Object.keys(req.body) });
    await client.query('COMMIT');

    // Remove old photo file if it was replaced
    if (req.file && existing.rows[0].photo_path) {
      fs.unlink(path.join(uploadDir, existing.rows[0].photo_path), () => {});
    }

    res.json({ data: toPublicStudent(rows[0], req) });
  } catch (err) {
    await client.query('ROLLBACK');
    if (req.file) fs.unlink(path.join(uploadDir, req.file.filename), () => {});
    next(err);
  } finally {
    client.release();
  }
}

// DELETE /students/:id
async function deleteStudent(req, res, next) {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    await client.query('BEGIN');
    const { rows } = await client.query('DELETE FROM students WHERE id = $1 RETURNING *', [id]);
    if (!rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Student not found' });
    }
    await logActivity(client, 'DELETE', id, { admission_number: rows[0].admission_number });
    await client.query('COMMIT');

    if (rows[0].photo_path) {
      fs.unlink(path.join(uploadDir, rows[0].photo_path), () => {});
    }

    res.json({ data: { id: Number(id) }, message: 'Student deleted successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}

// GET /students/meta/analytics - bonus analytics endpoint
async function getAnalytics(req, res, next) {
  try {
    const [byCourse, byYear, byGender, total] = await Promise.all([
      pool.query('SELECT course, COUNT(*)::int AS count FROM students GROUP BY course ORDER BY count DESC'),
      pool.query('SELECT year, COUNT(*)::int AS count FROM students GROUP BY year ORDER BY year'),
      pool.query('SELECT gender, COUNT(*)::int AS count FROM students GROUP BY gender'),
      pool.query('SELECT COUNT(*)::int AS count FROM students'),
    ]);

    res.json({
      totalStudents: total.rows[0].count,
      byCourse: byCourse.rows,
      byYear: byYear.rows,
      byGender: byGender.rows,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getAnalytics,
};
