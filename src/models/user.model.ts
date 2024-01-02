import mongoose, { Schema, Document } from 'mongoose';

interface MobileProps {
  country: string;
  code: number;
  number: number;
}

interface BillingProps {
  country: string;
  state: string;
  city: string;
  address: string;
}

interface StoreProps {
  name: string;
  description: string;
  location: BillingProps;
}

interface OTPProps {
  code: string;
  expiresAt: number;
}

interface AccountProps {
  platform: string;
  url: string;
}

interface verificationProps {
  token: string;
  isVerified: boolean;
}

interface PhotoProps {
  url: string;
  name: string;
}
export interface UserProps extends Document {
  isSeller: boolean;
  balance: number;
  firstName: string;
  lastName: string;
  bio: string;
  password: string;
  email: string;
  mobile: MobileProps;
  billing: BillingProps;
  store: StoreProps;
  otp: OTPProps;
  accounts: AccountProps[];
  verification: verificationProps;
  photo: PhotoProps;
}

const userSchema = new Schema<UserProps>(
  {
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
      code: { type: Number, default: 234 },
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
    accounts: [{ platform: { type: String }, url: { type: String } }],
    photo: {
      url: { type: String, default: '' },
      name: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

export const User = mongoose.model<UserProps>('user', userSchema);
