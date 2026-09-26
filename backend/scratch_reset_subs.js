import 'dotenv/config';
import mongoose from 'mongoose';

async function cleanup() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nutriflow';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const res = await mongoose.connection.collection('subscriptions').updateMany(
      { status: { $in: ['Pending Payment', 'Active'] } },
      { $set: { status: 'Cancelled' } }
    );
    console.log('Cancelled old subscriptions:', res);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

cleanup();
