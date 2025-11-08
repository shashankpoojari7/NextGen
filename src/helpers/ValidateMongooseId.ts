import mongoose from "mongoose";

export function safeObjectId(id: string) {
  return mongoose.isValidObjectId(id) ? new mongoose.Types.ObjectId(id) : null;
}

