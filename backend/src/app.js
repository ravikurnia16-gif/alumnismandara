const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes will be imported here
const authRoutes = require('./routes/auth.routes');
const alumniRoutes = require('./routes/alumni.routes');
const eventRoutes = require('./routes/event.routes');
const jobRoutes = require('./routes/job.routes');
const newsRoutes = require('./routes/news.routes');
const donationRoutes = require('./routes/donation.routes');
const tracerStudyRoutes = require('./routes/tracerStudy.routes');
const adminRoutes = require('./routes/admin.routes');
const publicRoutes = require('./routes/public.routes');
const settingRoutes = require('./routes/setting.routes');

app.use('/api/auth', authRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/admin/news', newsRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/tracer-study', tracerStudyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/settings', settingRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Backend is running' });
});

// Serve frontend static files
const frontendDistPath = path.join(__dirname, '../public');
app.use(express.static(frontendDistPath));

// Handle React routing, return all requests not matching API routes to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;
