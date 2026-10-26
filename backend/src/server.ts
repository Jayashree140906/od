import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app.js';
import { connectDB } from './config/db.js';

const PORT = Number(process.env.PORT) || 5050;
const HOST = '0.0.0.0';

async function bootstrap() {
  await connectDB();
  const app = createApp();

  app.listen(PORT, HOST, () => {
    console.log(`====================================================`);
    console.log(`🚀 CampusFlow Server running on http://${HOST}:${PORT}`);
    console.log(`📡 Health Check:  http://${HOST}:${PORT}/api/v1/health`);
    console.log(`📚 API Docs:      http://${HOST}:${PORT}/api-docs`);
    console.log(`🌐 Base API:      http://${HOST}:${PORT}/api/v1`);
    console.log(`====================================================`);
  });
}

bootstrap().catch((err) => {
  console.error('Fatal initialization error:', err);
  process.exit(1);
});
