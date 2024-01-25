import mongoose, { Schema, Types } from 'mongoose';

export type ReviewDoc = {
  rating: number;
  message: string;
  product: Types.ObjectId;
  user: Types.ObjectId;
};

const reviewSchema = new Schema<ReviewDoc>({
  rating: { type: Number, required: true },
  message: { type: String, required: true },
  product: { type: Schema.Types.ObjectId, required: true, ref: 'Products' },
  user: { type: Schema.Types.ObjectId, required: true, ref: 'Users' },
});

export const Review = mongoose.model('Reviews', reviewSchema);
