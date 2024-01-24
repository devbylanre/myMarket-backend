import mongoose, { Schema, Types } from 'mongoose';

type Image = {
  name: string;
  url: string;
};

export type ProductDoc = Document & {
  title: string;
  tagline: string;
  description: string;
  brand: string;
  model: string;
  category: string;
  price: number;
  discount: number;
  user: Types.ObjectId;
  views: number;
  tags: string[];
  images: Image[];
};

const productSchema = new Schema<ProductDoc>({
  title: { type: String, required: true },
  tagline: { type: String, required: true },
  description: { type: String, required: true },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  category: { type: String, required: true },
  views: { type: Number, default: 0 },
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  user: { type: Schema.Types.ObjectId, required: true, ref: 'Users' },
  images: [
    {
      name: { type: String, required: true },
      url: { type: String, required: true },
    },
  ],
});

export const Product = mongoose.model<ProductDoc>('Products', productSchema);
