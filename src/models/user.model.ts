import mongoose, { Schema, Document } from 'mongoose';

type Verification = {
  token: string;
  isVerified: boolean;
};

type Mobile = {
  country: string;
  code: number;
  number: number;
};

type Billing = {
  country: string;
  state: string;
  city: string;
  address: string;
};

type Location = {
  country: string;
  state: string;
  city: string;
  address: string;
};

type Store = {
  name: string;
  description: string;
  location: Location;
};

type Otp = {
  code: string;
  expiresAt: number;
};

type Account = {
  platform: string;
  url: string;
};

type Photo = {
  name: string;
  url: string;
};

export type UserDoc = Document & {
  role: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  bio: string;
  verification: Verification;
  mobile: Mobile;
  billing: Billing;
  followers: Schema.Types.ObjectId[];
  pinned: Schema.Types.ObjectId[];
  store: Store;
  otp: Otp;
  accounts: Account[];
  photo: Photo;
};

const userSchema = new Schema<UserDoc>(
  {
    role: { type: String, default: 'buyer', required: true },
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
      country: { type: String, default: '' },
      code: { type: Number, default: 234 },
      number: { type: Number, default: 0 },
    },
    billing: {
      country: { type: String, default: '' },
      state: { type: String, default: '' },
      city: { type: String, default: '' },
      address: { type: String, default: '' },
    },
    followers: [{ type: Schema.Types.ObjectId, ref: 'Users' }],
    pinned: [{ type: Schema.Types.Boolean, ref: 'Products' }],
    store: {
      name: { type: String, default: '' },
      description: { type: String, default: '' },
      location: {
        country: { type: String, default: '' },
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
      {
        platform: { type: String },
        url: { type: String },
      },
    ],
    photo: {
      name: { type: String, default: '' },
      url: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

export const User = mongoose.model<UserDoc>('Users', userSchema);
