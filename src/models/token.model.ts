import mongoose, { Schema, Types } from 'mongoose';

export type TokenDoc = Document & {
  user: Types.ObjectId;
  token: string;
  createdAt: Date;
};

const tokenSchema = new Schema<TokenDoc>({
  user: { type: Schema.Types.ObjectId, required: true, ref: 'Users' },
  token: { type: String, required: true },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now(),
    expires: 86000,
  },
});

export const Token = mongoose.model<TokenDoc>('Tokens', tokenSchema);
