import mongoose, { Schema, Document, Types } from "mongoose";

export interface Share extends Document {
  userId: Types.ObjectId;
  postId: Types.ObjectId;
  createdAt?: Date;
}

const shareSchema: Schema<Share> = new Schema(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    postId: { 
      type: Schema.Types.ObjectId, 
      ref: "Post", 
      required: true 
    },
  },
  { timestamps: true }
);

const Share = (mongoose.models.Share as mongoose.Model<Share>) || mongoose.model<Share>("Share", shareSchema);

export default Share;