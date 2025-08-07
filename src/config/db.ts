import mongoose from 'mongoose';

export async function connectDB() {
  try {
    await mongoose.connect(process.env.APP_DB!);
    console.log('MongoDB Connected!');
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    process.exit(1);
  }
}
