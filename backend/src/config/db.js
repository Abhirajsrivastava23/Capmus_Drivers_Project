const mongoose = require('mongoose');

let mongoServer = null;

const connectDB = async () => {
  // If already connected, return existing connection
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  const uri = process.env.MONGODB_URI;

  if (uri) {
    try {
      console.log(`[Database] Attempting connection to MongoDB URI: ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}`);
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    } catch (err) {
      console.warn(`[Database] External MongoDB connection failed: ${err.message}.`);
      if (process.env.VERCEL) {
        return null;
      }
    }
  }

  if (process.env.VERCEL) {
    console.warn('[Database] Running on Vercel without external MONGODB_URI. Memory server is skipped in serverless.');
    return null;
  }

  // Fallback to MongoMemoryServer for immediate zero-config out-of-the-box operation (local dev only)
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongoServer = await MongoMemoryServer.create();
    const memoryUri = mongoServer.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(`[Database] Embedded MongoDB Memory Server started successfully at: ${memoryUri}`);
    return conn;
  } catch (memErr) {
    console.error(`[Database] Critical error initializing MongoDB:`, memErr);
    throw memErr;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
    console.log('[Database] MongoDB disconnected cleanly.');
  } catch (err) {
    console.error('[Database] Disconnect error:', err);
  }
};

module.exports = { connectDB, disconnectDB };
