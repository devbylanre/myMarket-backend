import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUser extends Document {
  isSeller: boolean;
  balance: number;
  firstName: string;
  lastName: string;
  bio: string;
  password: string;
  email: string;
  followers: Types.ObjectId[];
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
  accounts: {
    platform: string;
    url: string;
  }[];
  savedProducts: Types.ObjectId[];
  verification: {
    token: string;
    isVerified: boolean;
  };
  photo: {
    url: string;
    name: string;
  };
}

const userSchema = new Schema<IUser>(
  {
    isSeller: { type: Boolean, default: false },
    balance: { type: Number, default: 0.0 },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    bio: { type: String, required: true },
    savedProducts: [{ type: Schema.Types.ObjectId }],
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
      followers: [{ type: Schema.Types.ObjectId }],
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
    accounts: [
      { platform: { type: String }, url: { type: String } },
      { _id: false },
    ],
    photo: {
      url: { type: String, default: '' },
      name: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('user', userSchema);
