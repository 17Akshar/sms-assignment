# The Registrar — Student Management System

A full-stack Student Management System built with **React**, **Node.js/Express**, and **PostgreSQL**. Supports admitting, editing, listing, searching, filtering, and dropping (deleting) students, with photo uploads and an auto-generated, unique Admission Number for every record.

---

## Technologies Used

| Layer      | Technology                                                        |
|------------|---------------------------------------------------------------------|
| Frontend   | React 18, React Router, Vite, Tailwind CSS, Axios                  |
| Backend    | Node.js, Express.js, express-validator, Multer (photo uploads)     |
| Database   | PostgreSQL (`pg` driver, no ORM — raw parameterized SQL)            |
| Dev tools  | Docker Compose (local Postgres), dotenv, morgan, nodemon            |

---

## Project Structure

```
sms/
├── backend/
│   ├── src/
│   │   ├── config/db.js           # PostgreSQL connection pool
│   │   ├── controllers/           # Route handlers / business logic
│   │   ├── db/schema.sql          # Table definitions, indexes, triggers
│   │   ├── db/migrate.js          # Runs schema.sql against the DB
│   │   ├── db/seed.js             # Optional sample data
│   │   ├── middleware/            # Upload, validation, error handling
│   │   ├── routes/studentRoutes.js
│   │   ├── utils/admissionNumber.js
│   │   ├── app.js
│   │   └── server.js
│   ├── uploads/                   # Uploaded student photos (gitignored)
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/client.js          # Axios wrapper for the Students API
│   │   ├── components/            # Masthead, StudentForm, Toast, etc.
│   │   ├── pages/                 # StudentListPage, StudentFormPage
│   │   ├── utils/validators.js    # Client-side validation rules
│   │   ├── App.jsx / main.jsx
│   │   └── styles/index.css
│   ├── .env.example
│   └── package.json
├── docker-compose.yml             # One-command local PostgreSQL
└── README.md
```

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ (or Docker, see below)

### 1. Database

**Option A — Docker (recommended):**
```bash
docker compose up -d
```
This starts a PostgreSQL 16 container on `localhost:5432` with database `student_management`, user `postgres`, password `postgres`.

**Option B — Local PostgreSQL:**
Create a database yourself, e.g.:
```bash
createdb student_management
```

### 2. Backend

```bash
cd backend
cp .env.example .env      # adjust DB credentials if needed
npm install
npm run migrate           # creates tables, indexes, triggers
npm run seed               # optional: inserts 3 sample students
npm run dev                # starts API on http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env      # VITE_API_URL should point to the backend
npm install
npm run dev                 # starts app on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

### 4. Production build

```bash
cd frontend && npm run build     # outputs static assets to frontend/dist
cd backend && npm start          # runs the API with NODE_ENV=production
```
Serve `frontend/dist` from any static host (Netlify, Vercel, Nginx, etc.) and point `VITE_API_URL` at your deployed backend URL.

---

## API Endpoints

Base URL: `http://localhost:5000`

| Method | Endpoint                  | Description                                              |
|--------|----------------------------|------------------------------------------------------------|
| GET    | `/health`                  | Health check                                                |
| GET    | `/students`                | List students. Query params: `page`, `limit`, `search`, `course`, `year`, `sortBy`, `sortDir` |
| GET    | `/students/:id`             | Fetch a single student                                       |
| POST   | `/students`                 | Create a student (`multipart/form-data`, field `photo` optional) |
| PUT    | `/students/:id`              | Update a student (`multipart/form-data`, field `photo` optional) |
| DELETE | `/students/:id`               | Delete a student                                              |
| GET    | `/students/meta/analytics`    | Aggregate counts by course, year, gender (bonus)               |

**Student object shape:**
```json
{
  "id": 1,
  "admission_number": "ADM-2026-0001",
  "name": "Aarav Sharma",
  "course": "B.Sc. Computer Science",
  "year": 2,
  "date_of_birth": "2004-03-12",
  "email": "aarav.sharma@example.com",
  "mobile_number": "9876543210",
  "gender": "Male",
  "address": "Mumbai, Maharashtra",
  "photo_path": "1731000000000-123456789.jpg",
  "photo_url": "http://localhost:5000/uploads/1731000000000-123456789.jpg",
  "created_at": "2026-07-14T10:00:00.000Z",
  "updated_at": "2026-07-14T10:00:00.000Z"
}
```

**List response shape:**
```json
{
  "data": [ /* array of students */ ],
  "pagination": { "page": 1, "limit": 8, "total": 23, "totalPages": 3 }
}
```

---

## Key Design Decisions

- **Admission Number generation** — tracked in a dedicated `admission_counters` table, incremented atomically via `INSERT ... ON CONFLICT ... DO UPDATE RETURNING` inside the same transaction as the insert. This guarantees uniqueness even under concurrent requests, without relying on client-supplied values. Format: `ADM-<year>-<4-digit sequence>`.
- **Validation runs twice** — once in the browser (`frontend/src/utils/validators.js`) for instant feedback, and again on the server (`express-validator`) so the API is safe to call directly (Postman, another client, etc.).
- **Photos** are stored on disk under `backend/uploads/` with a random filename; only the filename is stored in the `photo_path` column, and the API derives a full `photo_url` per request so the frontend never has to know the storage path.
- **No ORM** — raw parameterized SQL via `pg`, to keep query behavior (indexes, `ON CONFLICT`, transactions) explicit and easy to review.
- **Transactions** wrap every write (create/update/delete) together with an `activity_logs` insert, so the audit trail and the record change are always consistent.

## Bonus Features Implemented

- ✅ Search (name, email, admission number) and filter (course, year)
- ✅ Server-side pagination and sortable columns
- ✅ Analytics endpoint (totals by course, year, gender) surfaced in the UI
- ✅ Activity logging (`activity_logs` table records every create/update/delete)
- ✅ Database indexes on `course`, `year`, `name`, `admission_number`
- ✅ Environment variables for all configuration (`.env.example` in both apps)
- ✅ Docker Compose for one-command local PostgreSQL

## Assumptions

- Admission Number is generated server-side and is never editable by the user.
- "Year" refers to year of study (1–6) rather than a calendar/academic year.
- One photo per student; re-uploading on edit replaces (and deletes) the previous file.
- Email and Admission Number are enforced unique at the database level; the API returns `409 Conflict` on collision.
