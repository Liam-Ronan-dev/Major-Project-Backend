import * as dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

export const connectDB = async () => {
  const dbURI = process.env.MONGO_URI;

  try {
    await mongoose.connect(dbURI);
    console.log(`MongoDB connected successfully!`);
  } catch (error) {
    console.error(`Failed to connect to Database: ${error}`);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB disconnected successfully');
  } catch (error) {
    console.error(`Error disconnecting from MongoDB: ${error}`);
  }
};
