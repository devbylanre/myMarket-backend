import mongoose, { Schema, Types } from 'mongoose';

export interface UserTypes {
  isSeller: boolean;
  balance: number;
  firstName: string;
  lastName: string;
  bio: string;
  password: string;
  email: string;
  mobile: {
    country: string;
    countryCode: number;
    number: number;
  };
  billing: {
    country: string;
    state: string;
    city: string;
    address: string;
  };
  store: {
    name: string;
    description: string;
    followers: Types.ObjectId[];
    location: {
      country: string;
      state: string;
      city: string;
      address: string;
    };
  };
  otp: {
    code: string;
    expiresAt: number;
  };
  social: string[];
  savedProducts: Types.ObjectId[];
  verification: {
    token: string;
    isVerified: boolean;
  };
}

const userSchema = new Schema<UserTypes>({
  isSeller: { type: Boolean, default: false },
  balance: { type: Number, default: 0.0 },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String, required: true },
  verification: {
    token: { type: String, default: '' },
    isVerified: { type: Boolean, default: false },
  },
  mobile: {
    country: { type: String, default: 'Nigeria' },
    countryCode: { type: Number, default: 234 },
    number: { type: Number, default: 0 },
  },
  billing: {
    country: { type: String, default: 'Nigeria' },
    state: { type: String, default: '' },
    city: { type: String, default: '' },
    address: { type: String, default: '' },
  },
  store: {
    name: { type: String, default: '' },
    description: { type: String, default: '' },
    followers: [{ type: Schema.Types.ObjectId, default: [] }],
    location: {
      country: { type: String, default: 'Nigeria' },
      state: { type: String, default: '' },
      city: { type: String, default: '' },
      address: { type: String, default: '' },
    },
  },
  otp: {
    code: { type: String, default: '' },
    expiresAt: { type: Number, default: 0 },
  },
  social: [{ type: String, default: [] }],
  savedProducts: [{ type: Schema.Types.ObjectId, default: [] }],
});

export const User = mongoose.model<UserTypes>('user', userSchema);
