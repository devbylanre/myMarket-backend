import mongoose from 'mongoose';

// Connect to database
export function connectToDB(uri: string, onSuccess: () => void) {
  mongoose
    .connect(uri, { serverSelectionTimeoutMS: 5000 })
    .then(onSuccess)
    .catch((error) => console.error(`Failed to connect to database: ${error}`));
}
