import mongoose, { Schema, Document, Types } from "mongoose";

export interface Like extends Document {
  postId: Types.ObjectId;
  userId: Types.ObjectId;
}

const likeSchema = new Schema<Like>({
  postId: { 
    type: Schema.Types.ObjectId, 
    ref: "Post", 
    required: true 
  },
  userId: { 
      type: Schema.Types.ObjectId, 
      ref: "User" 
    }
});

likeSchema.index({ postId: 1, userId: 1 }, { unique: true });

const Like = mongoose.models.Like || mongoose.model("Like", likeSchema);

export default Like;