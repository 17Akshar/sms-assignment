-- Student Management System schema
-- Run with: psql -U <user> -d <database> -f src/db/schema.sql

CREATE TABLE IF NOT EXISTS students (
    id                SERIAL PRIMARY KEY,
    admission_number  VARCHAR(20) NOT NULL UNIQUE,
    name              VARCHAR(120) NOT NULL,
    course            VARCHAR(100) NOT NULL,
    year              SMALLINT NOT NULL CHECK (year BETWEEN 1 AND 6),
    date_of_birth     DATE NOT NULL,
    email             VARCHAR(150) NOT NULL UNIQUE,
    mobile_number     VARCHAR(15) NOT NULL,
    gender            VARCHAR(20) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    address           TEXT NOT NULL,
    photo_path        VARCHAR(255),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Keeps a running counter per admission year so admission numbers are
-- generated atomically and never collide, even under concurrent inserts.
CREATE TABLE IF NOT EXISTS admission_counters (
    admission_year  INTEGER PRIMARY KEY,
    last_sequence   INTEGER NOT NULL DEFAULT 0
);

-- Lightweight audit trail (bonus: activity logging)
CREATE TABLE IF NOT EXISTS activity_logs (
    id           SERIAL PRIMARY KEY,
    action       VARCHAR(20) NOT NULL, -- CREATE | UPDATE | DELETE
    student_id   INTEGER,
    details      JSONB,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes to speed up common lookups/filters (bonus: indexing)
CREATE INDEX IF NOT EXISTS idx_students_course ON students (course);
CREATE INDEX IF NOT EXISTS idx_students_year ON students (year);
CREATE INDEX IF NOT EXISTS idx_students_name ON students (LOWER(name));
CREATE INDEX IF NOT EXISTS idx_students_admission_number ON students (admission_number);

-- Keep updated_at fresh on every row update
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_students_updated_at ON students;
CREATE TRIGGER trg_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
