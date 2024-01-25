import mongoose, { Schema, Types } from 'mongoose';

export type PinDoc = {
  product: Types.ObjectId;
  pinnedBy: Types.ObjectId;
};

const pinSchema = new Schema<PinDoc>({
  product: { type: Schema.Types.ObjectId, required: true, ref: 'Products' },
  pinnedBy: { type: Schema.Types.ObjectId, required: true, ref: 'Users' },
});

export const Pin = mongoose.model<PinDoc>('Pins', pinSchema);
