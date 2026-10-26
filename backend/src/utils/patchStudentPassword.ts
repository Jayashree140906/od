import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { User } from '../models/User.js';

async function patchPassword() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campusflow';
  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri);

  const student = await User.findOne({ email: 'student@campusflow.edu' }).select('+password');
  if (!student) {
    console.error('Student user not found!');
    await mongoose.disconnect();
    process.exit(1);
  }

  // Mongoose pre-save hook hashes the password automatically
  student.password = '123456';
  student.verificationStatus = 'verified';
  student.isActive = true;
  await student.save();

  console.log('✅ Student password updated to: 123456');
  console.log('✅ Student verificationStatus set to: verified');
  await mongoose.disconnect();
}

patchPassword().catch((err) => {
  console.error('Patch failed:', err);
  process.exit(1);
});
