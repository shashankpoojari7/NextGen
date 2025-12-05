import mongoose, { Schema, Document, Types } from "mongoose";

export type NotificationType =
  | "MESSAGE"
  | "LIKE"
  | "COMMENT";

export interface INotification extends Document {
  recipient: Types.ObjectId;
  actor: Types.ObjectId;
  type: NotificationType;
  entityId?: Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    actor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["LIKE", "COMMENT", "FOLLOW", "FOLLOW_REQUEST"],
      required: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Notification = (mongoose.models.Notification as mongoose.Model<INotification>) || mongoose.model<INotification>("Notification", notificationSchema);

export default Notification;
