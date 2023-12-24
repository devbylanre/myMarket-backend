import mongoose, { Schema, Types } from 'mongoose';

interface IProduct {
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
  sellerId: Types.ObjectId;
  reviews: {
    userId: Types.ObjectId;
    rate: number;
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
  images: [
    {
      name: { type: String, required: true },
      url: { type: String, required: true },
      _id: false,
    },
  ],
  tags: [{ type: String, required: true }],
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  sellerId: { type: Schema.Types.ObjectId, required: true },
  reviews: [
    {
      userId: { type: Types.ObjectId },
      rate: { type: Number },
      message: { type: String },
    },
  ],
});

export const Product = mongoose.model<IProduct>('Product', productSchema);
