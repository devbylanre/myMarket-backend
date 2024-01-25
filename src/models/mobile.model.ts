import mongoose, { Schema, Types } from 'mongoose';

export type MobileDoc = Document & {
  country: string;
  code: number;
  number: number;
  reference: Types.ObjectId;
};

const mobileSchema = new Schema<MobileDoc>({
  country: { type: String, required: true },
  code: { type: Number, required: true },
  number: { type: Number, required: true },
  reference: { type: Schema.Types.ObjectId, required: true, ref: 'Users' },
});

export const Mobile = mongoose.model('Mobiles', mobileSchema);
