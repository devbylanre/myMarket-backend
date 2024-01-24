import mongoose, { Schema, Types } from 'mongoose';

type OtpDoc = {
  reference: Types.ObjectId;
  otp: string;
  expiry: number;
};

const OtpSchema = new Schema<OtpDoc>({
  reference: { type: Schema.Types.ObjectId, required: true, ref: 'Users' },
  otp: { type: String, required: true },
  expiry: { type: Number, required: true },
});

export const OTP = mongoose.model<OtpDoc>('Otps', OtpSchema);
