const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

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
    version: '1.0.1',
    hasMongoUri: Boolean(process.env.MONGODB_URI),
    mongooseState: mongoose.connection.readyState,
    timestamp: new Date().toISOString(),
  });
});

// Ensure database is connected for every incoming API request (Serverless safe)
app.use(async (req, res, next) => {
  if (req.path === '/api/health' || req.path.startsWith('/downloads')) {
    return next();
  }
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    next();
  } catch (err) {
    console.error('[DB Middleware Error]', err.message);
    next(err);
  }
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

    // Auto-seed if database is freshly started or FORCE_RESEED is set
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0 || process.env.FORCE_RESEED === 'true') {
      console.log('[Server] Running clean initial seedData...');
      const { seedData } = require('./utils/seedData');
      await seedData();
    } else {
      // Ensure student name is Ananya
      await User.updateMany(
        { $or: [{ name: /Aarav/i }, { email: 'aarav.sharma@cumail.in' }] },
        { name: 'Ananya Sharma' }
      );

      // Ensure dedicated admin credentials: campusdrivers000 / campus1010
      const adminUser = await User.findOne({ role: 'admin' });
      if (adminUser) {
        adminUser.student_id = 'CAMPUSDRIVERS000';
        adminUser.password = 'campus1010';
        adminUser.name = 'Campus Drivers Administration';
        await adminUser.save();
        console.log('[Server] Dedicated admin account updated: campusdrivers000 / campus1010');
      } else {
        await User.create({
          name: 'Campus Drivers Administration',
          email: 'campusdrivers000@campusdrivers.cu.ac.in',
          phone: '9876543210',
          student_id: 'CAMPUSDRIVERS000',
          course: 'Office of Student Welfare & Transport',
          semester: 'Staff',
          password: 'campus1010',
          verification_status: 'verified',
          role: 'admin',
        });
        console.log('[Server] Dedicated admin account created: campusdrivers000 / campus1010');
      }
    }

    if (!process.env.VERCEL) {
      server.listen(PORT, () => {
        console.log('========================================================');
        console.log(`🚀 Campus Drivers Backend Server is LIVE on port ${PORT}`);
        console.log(`📍 Designed for Chandigarh University Uttar Pradesh`);
        console.log(`🔗 API Base: http://localhost:${PORT}/api`);
        console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
        console.log('========================================================');
      });
    } else {
      console.log('🚀 Campus Drivers Express app initialized for Vercel Serverless environment.');
    }
  } catch (err) {
    console.error('Failed to start Campus Drivers server:', err);
    if (!process.env.VERCEL) {
      process.exit(1);
    }
  }
};

startServer();

module.exports = app;
module.exports.app = app;
module.exports.server = server;
