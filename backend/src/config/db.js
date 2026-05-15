import mongoose from 'mongoose';

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  console.log(mongoUri);

  if (!mongoUri) {
    throw new Error('MONGO_URI is required.');
  }

  mongoose.set('strictQuery', true);

  const connection = await mongoose.connect(mongoUri);

  console.log(`MongoDB connected: ${connection.connection.host}`);
  return connection;
};

export default connectDB;
