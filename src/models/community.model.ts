import mongoose, { Schema, Types } from 'mongoose';

type CommunityDoc = {
  follower: Types.ObjectId;
  reference: Types.ObjectId;
};

const followerSchema = new Schema<CommunityDoc>({
  follower: { type: Schema.Types.ObjectId, required: true, ref: 'Users' },
  reference: { type: Schema.Types.ObjectId, required: true, ref: 'Users' },
});

export const Community = mongoose.model('Communities', followerSchema);
