const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log('[Database] Already connected');
    return;
  }

  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(mongoURI);
    isConnected = true;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host} (${conn.connection.name})`);

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      console.warn('[Database] MongoDB disconnected');
    });

    mongoose.connection.on('error', (err) => {
      console.error('[Database] MongoDB connection error:', err.message);
    });

    return conn;
  } catch (error) {
    console.error(`[Database Error] Failed to connect to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
