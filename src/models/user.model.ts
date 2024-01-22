import mongoose, { Schema, Document } from 'mongoose';

const userSchema = new Schema(
  {
    role: { type: String, default: 'buyer' },
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
    store: {
      name: { type: String, default: '' },
      description: { type: String, default: '' },
      followers: [{ type: Schema.Types.ObjectId }],
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

export const User = mongoose.model('user', userSchema);
