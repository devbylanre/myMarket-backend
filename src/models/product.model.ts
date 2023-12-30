import mongoose, { Schema, Types } from 'mongoose';

export interface IProduct {
  title: string;
  tagline: string;
  description: string;
  brand: string;
  model: string;
  category: string;
  images: {
    name: string;
    url: string;
  }[];
  tags: string[];
  price: number;
  discount: number;
  user: Types.ObjectId;
  views: number;
  likes: Types.ObjectId[];
  reviews: {
    user: Types.ObjectId;
    rating: number;
    message: string;
  }[];
}

const productSchema = new Schema<IProduct>({
  title: { type: String, required: true },
  tagline: { type: String, required: true },
  description: { type: String, required: true },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  category: { type: String, required: true },
  likes: [{ type: Schema.Types.ObjectId }],
  views: { type: Number, default: 0 },
  images: [
    {
      name: { type: String, required: true },
      url: { type: String, required: true },
      _id: false,
    },
  ],
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  user: { type: Schema.Types.ObjectId, required: true },
  reviews: [
    {
      user: { type: Types.ObjectId },
      rating: { type: Number },
      message: { type: String },
    },
  ],
});

export const Product = mongoose.model<IProduct>('Product', productSchema);
