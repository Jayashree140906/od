import 'dotenv/config';
import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  const connStr = process.env.MONGODB_URI;

  if (!connStr) {
    console.error('[MongoDB] MONGODB_URI is not set in .env!');
    process.exit(1);
  }

  console.log('[MongoDB] Connecting to Atlas...');

  try {
    await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log(`[MongoDB] ✅ Connected to Atlas: ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (error) {
    console.error('[MongoDB] ❌ Atlas connection failed:', error);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Disconnected from Atlas.');
});

mongoose.connection.on('error', (err) => {
  console.error('[MongoDB] Runtime error:', err);
});
