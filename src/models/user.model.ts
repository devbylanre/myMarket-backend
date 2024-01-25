import mongoose, { Schema, Document } from 'mongoose';

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
  token: string;
  verified: boolean;
  pinned: Schema.Types.ObjectId[];
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
    token: { type: String, required: true },
    verified: { type: Boolean, required: true },
    pinned: [{ type: Schema.Types.Boolean, ref: 'Products' }],
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
