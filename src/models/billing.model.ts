import mongoose, { Schema, Types } from 'mongoose';

export type BillingDoc = Document & {
  country: string;
  state: string;
  city: string;
  address: string;
  reference: Types.ObjectId;
};

const BillingSchema = new Schema<BillingDoc>({
  country: { type: String, required: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  address: { type: String, required: true },
  reference: { type: Schema.Types.ObjectId, required: true, ref: 'Users' },
});

export const Billing = mongoose.model<BillingDoc>('Billings', BillingSchema);
