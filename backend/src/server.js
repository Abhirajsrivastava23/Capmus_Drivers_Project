const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const { connectDB } = require('./config/db');
const { initSocketIO } = require('./sockets/socketHandler');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/authRoutes');
const rideRoutes = require('./routes/rideRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const chatRoutes = require('./routes/chatRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const safetyRoutes = require('./routes/safetyRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const server = http.createServer(app);

// Socket.IO configuration with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Attach socket io instance to app
app.set('io', io);
initSocketIO(io);

// Core Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Global API Rate Limiter
app.use('/api', apiLimiter);

// Serve static downloads (e.g. Android APK)
const path = require('path');
const fs = require('fs');

app.get('/downloads/CampusRide_v1.0.0.apk', (req, res) => {
  res.redirect(301, '/downloads/CampusDrivers_v1.0.0.apk');
});

app.use('/downloads', express.static(path.join(__dirname, '../public/downloads'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.apk')) {
      res.setHeader('Content-Type', 'application/vnd.android.package-archive');
      res.setHeader('Content-Disposition', 'attachment; filename="CampusDrivers_v1.0.0.apk"');
    }
  }
}));

app.get('/api/download/apk', (req, res) => {
  const driversApk = path.join(__dirname, '../public/downloads/CampusDrivers_v1.0.0.apk');
  res.setHeader('Content-Type', 'application/vnd.android.package-archive');
  res.download(driversApk, 'CampusDrivers_v1.0.0.apk');
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    app: 'Campus Drivers API',
    university: 'Chandigarh University Uttar Pradesh (Lucknow Campus)',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/messages', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/safety', safetyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);

// 404 Route Not Found
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: [${req.method}] ${req.originalUrl}`,
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start Server and connect Database
const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if database is freshly started
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Server] Database is empty. Running initial seedData...');
      const { seedData } = require('./utils/seedData');
      await seedData();
    } else {
      // Ensure student name is Ananya
      await User.updateMany(
        { $or: [{ name: /Aarav/i }, { email: 'aarav.sharma@cumail.in' }] },
        { name: 'Ananya Sharma' }
      );
    }

    server.listen(PORT, () => {
      console.log('========================================================');
      console.log(`🚀 Campus Drivers Backend Server is LIVE on port ${PORT}`);
      console.log(`📍 Designed for Chandigarh University Uttar Pradesh`);
      console.log(`🔗 API Base: http://localhost:${PORT}/api`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
      console.log('========================================================');
    });
  } catch (err) {
    console.error('Failed to start Campus Drivers server:', err);
    process.exit(1);
  }
};

startServer();

module.exports = { app, server };
