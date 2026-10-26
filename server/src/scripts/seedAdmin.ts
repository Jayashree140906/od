import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  password: String,
  role: String,
  isActive: { type: Boolean, default: true },
  verificationStatus: { type: String, default: 'verified' },
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

async function seedAdmin() {
  console.log('Connecting to Atlas...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to Atlas:', mongoose.connection.host);

  const email = 'jayashree123@gmail.com';
  const password = 'jayashree@123';
  const hashed = await bcrypt.hash(password, 10);

  const result = await User.findOneAndUpdate(
    { email },
    { name: 'Jayashree Admin', email, password: hashed, role: 'admin', isActive: true, verificationStatus: 'verified' },
    { upsert: true, new: true }
  );

  console.log('Admin upserted:', result.email, '| role:', result.role);
  await mongoose.disconnect();
  process.exit(0);
}

seedAdmin().catch((err) => { console.error('Seed failed:', err); process.exit(1); });
