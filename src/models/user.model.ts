import mongoose, { Schema, Types } from 'mongoose';

export interface UserTypes {
  isSeller: boolean;
  balance: number;
  firstName: string;
  lastName: string;
  bio: string;
  password: string;
  isVerified: boolean;
  contact: {
    email: string;
    mobileNumber: string;
  };
  billing: {
    state: string;
    city: string;
    address: string;
  };
  store: {
    name: string;
    description: string;
    followers: Types.ObjectId[];
    location: {
      state: string;
      city: string;
      address: string;
    };
  };
  token: {
    key: string;
    expiration: number;
  };
  social: string[];
}

const userSchema = new Schema<UserTypes>({
  isSeller: { type: Boolean, required: true },
  balance: { type: Number, default: 0.0 },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  bio: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  password: { type: String, required: true },
  contact: {
    email: { type: String, required: true, unique: true },
    mobileNumber: { type: String, default: '' },
  },
  billing: {
    state: { type: String, default: '' },
    city: { type: String, default: '' },
    address: { type: String, default: '' },
  },
  store: {
    name: { type: String, default: '' },
    description: { type: String, default: '' },
    followers: [{ type: Schema.Types.ObjectId, default: [] }],
    location: {
      state: { type: String, default: '' },
      city: { type: String, default: '' },
      address: { type: String, default: '' },
    },
  },
  token: {
    key: { type: String, default: '' },
    expiration: { type: Number, default: 0 },
  },
  social: [{ type: String, default: [] }],
});

export const User = mongoose.model<UserTypes>('user', userSchema);
