import mongoose, { Schema, Document, Types } from "mongoose";

export interface Comment extends Document {
  userId: Types.ObjectId;
  postId: Types.ObjectId;
  text: string;
  createdAt?: Date;
}

const commentSchema: Schema<Comment> = new Schema(
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
    text: { 
      type: String, 
      required: true 
    },
  },
  { timestamps: true }
);

const Comment =(mongoose.models.Comment as mongoose.Model<Comment>) || mongoose.model<Comment>("Comment", commentSchema);

export default Comment;