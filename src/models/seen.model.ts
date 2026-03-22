import mongoose, { Schema, Document } from "mongoose";

export interface SeenDocument extends Document {
  userId: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
  seenAt: Date;
}

const seenSchema = new Schema<SeenDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
    seenAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

seenSchema.index({ userId: 1, postId: 1 }, { unique: true });

const Seen = (mongoose.models.Seen as mongoose.Model<SeenDocument>) || mongoose.model("Seen", seenSchema)

export default Seen;
