const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const studentRoutes = require('./routes/studentRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { uploadDir } = require('./middleware/upload');

const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Serve uploaded student photos statically
app.use('/uploads', express.static(uploadDir));

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use('/students', studentRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
