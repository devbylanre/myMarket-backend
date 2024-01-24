import mongoose, { Model, Schema, Types } from 'mongoose';

type StoreDoc = {
  name: string;
  description: string;
  city: string;
  state: string;
  country: string;
  address: string;
  reference: Types.ObjectId;
};

const StoreSchema = new Schema<StoreDoc>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  country: { type: String, required: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  address: { type: String, required: true },
  reference: { type: Schema.Types.ObjectId, required: true, ref: 'Users' },
});

export const Store = mongoose.model<StoreDoc>('Stores', StoreSchema);
