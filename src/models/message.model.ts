import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMessage extends Document {
  senderId: string;
  receiverId: string;
  conversationId: string;
  content: string;
  createdAt: Date;
  isRead: boolean;
  readAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    senderId: {
      type: String,
      required: true,
    },
    receiverId: {
      type: String,
      required: true,
    },
    conversationId: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    }
  },
  { timestamps: true }
);

const Message = mongoose.models.Message as mongoose.Model<IMessage> || mongoose.model<IMessage>("Message", MessageSchema);

export default Message
