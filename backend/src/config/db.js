const mongoose = require('mongoose');

// Disable Mongoose command buffering so queries fail fast with an error
// instead of hanging indefinitely and causing 10s+ request timeouts.
mongoose.set('bufferCommands', false);

let mongoServer = null;
let connectionPromise = null;

const connectDB = async () => {
  // If already connected, return existing connection
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // If a connection attempt is already in flight, reuse it to avoid race conditions
  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = (async () => {
    const uri = process.env.MONGODB_URI;

    if (uri && uri.trim()) {
      try {
        console.log(`[Database] Attempting connection to MongoDB URI: ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}`);
        const conn = await mongoose.connect(uri, {
          serverSelectionTimeoutMS: 4000,
          connectTimeoutMS: 4000,
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

    // Attempt local MongoDB on standard port (127.0.0.1:27017) first if available
    try {
      const localUri = 'mongodb://127.0.0.1:27017/campus_drivers';
      const conn = await mongoose.connect(localUri, {
        serverSelectionTimeoutMS: 1500,
        connectTimeoutMS: 1500,
      });
      console.log(`[Database] Connected to local MongoDB daemon at: ${localUri}`);
      return conn;
    } catch (localErr) {
      // Local mongod not running, continue to MongoMemoryServer
    }

    // Fallback to MongoMemoryServer for immediate zero-config out-of-the-box operation (local dev only)
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      if (!mongoServer) {
        mongoServer = await MongoMemoryServer.create({ binary: { version: '7.0.14' } });
      }
      const memoryUri = mongoServer.getUri();
      const conn = await mongoose.connect(memoryUri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      });
      console.log(`[Database] Embedded MongoDB Memory Server started successfully at: ${memoryUri}`);
      return conn;
    } catch (memErr) {
      console.error(`[Database] Critical error initializing MongoDB:`, memErr.message);
      return null;
    }
  })().finally(() => {
    connectionPromise = null;
  });

  return connectionPromise;
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
      mongoServer = null;
    }
    console.log('[Database] MongoDB disconnected cleanly.');
  } catch (err) {
    console.error('[Database] Disconnect error:', err);
  }
};

module.exports = { connectDB, disconnectDB };
