import mongoose, { Schema, Document } from 'mongoose';

type Photo = {
  name: string;
  url: string;
};

export type UserDoc = Document & {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  bio: string;
  photo: Photo;
  isVerified: boolean;
  createdAt: Date;
};

const userSchema = new Schema<UserDoc>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String, required: true },
  isVerified: { type: Boolean, required: true, default: false },
  createdAt: { type: Date, required: true, default: Date.now() },
  photo: {
    name: { type: String, default: '' },
    url: { type: String, default: '' },
  },
});

export const User = mongoose.model<UserDoc>('Users', userSchema);
