import mongoose, { Schema, Document, Types } from "mongoose";

export interface FollowType  extends Document{
  followerId: Types.ObjectId;
  followingId: Types.ObjectId;
  isAccepted: Boolean;
}

const followSchema: Schema<FollowType> = new Schema(
  {
    followerId: {
      type: Schema.Types.ObjectId, 
      ref: "User",
      required: true
    },
    followingId: {
      type: Schema.Types.ObjectId, 
      ref: "User",
      required: true
    },
    isAccepted : {
      type: Boolean,
      default: false
    }
  }, 
  { timestamps: true }
);

const Follow = (mongoose.models.Follow as mongoose.Model<FollowType>) || mongoose.model("Follow" , followSchema)

export default Follow;