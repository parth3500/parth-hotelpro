const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route modules
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const staffRoutes = require('./routes/staffRoutes');
const adminRoutes = require('./routes/adminRoutes');

// shortcut: single-node HTTP listener without clustering, upgrade to PM2 / Node.js cluster module for multi-core scalability

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check & Root Info
app.get(['/health', '/api/health'], (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'HotelPro Management API'
  });
});

// Serve static client build if present
const clientDist = path.join(__dirname, '../client/dist');
if (require('fs').existsSync(clientDist)) {
  app.use(express.static(clientDist));

  // Single-Page Application (SPA) HTML fallback:
  // For any browser navigation GET request that accepts HTML and is not an API call, serve index.html
  app.use((req, res, next) => {
    const acceptsHtml = req.headers.accept && req.headers.accept.includes('text/html');
    if (
      req.method === 'GET' &&
      acceptsHtml &&
      !req.path.startsWith('/api') &&
      !req.path.startsWith('/health')
    ) {
      return res.sendFile(path.join(clientDist, 'index.html'));
    }
    next();
  });
}

// Global API Middlewares & Routes
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);
app.use('/api', authRoutes); // supports POST /api/register, POST /api/login, etc.
app.use('/', authRoutes);    // supports POST /register, POST /login, etc.

app.use('/api/rooms', roomRoutes);
app.use('/rooms', roomRoutes);

app.use('/api/bookings', bookingRoutes);
app.use('/bookings', bookingRoutes);

app.use('/api/payments', paymentRoutes);
app.use('/payments', paymentRoutes);

app.use('/api/reviews', reviewRoutes);
app.use('/reviews', reviewRoutes);

app.use('/api/notifications', notificationRoutes);
app.use('/notifications', notificationRoutes);

app.use('/api/services', serviceRoutes);
app.use('/services', serviceRoutes);

app.use('/api/staff', staffRoutes);
app.use('/staff', staffRoutes);

app.use('/api/admin', adminRoutes);
app.use('/admin', adminRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

let server = null;
if (require.main === module) {
  connectDB().then(async () => {
    try {
      const { seed } = require('./config/seed');
      await seed();
    } catch (e) {
      console.log('[Seed] Auto-seed info:', e.message);
    }
    server = app.listen(PORT, () => {
      console.log(`[HotelPro API] Server running on port ${PORT}`);
    });
  }).catch(err => {
    console.error('[HotelPro API] Startup failure:', err);
    process.exit(1);
  });
}

module.exports = app;
