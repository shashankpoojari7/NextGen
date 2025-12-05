import mongoose, { Schema, Document, Model } from "mongoose";

export interface IConversation extends Document {
  members: string[];
  lastMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    members: {
      type: [String],
      required: true,
    },
    lastMessage: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Conversation = mongoose.models.Conversation as mongoose.Model<IConversation> || mongoose.model<IConversation>("Conversation", ConversationSchema);

export default Conversation;
