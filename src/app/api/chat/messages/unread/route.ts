import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/database/dbConnection";
import Message from "@/models/message.model";
import Conversation from "@/models/conversation.model";
import { ApiResponse } from "@/lib/ApiResponse";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        new ApiResponse(400, "User ID missing"),
        { status: 400 }
      );
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Find all conversations where user is a participant
    const unread = await Conversation.aggregate([
      {
        $match: {
          participants: userObjectId
        }
      },

      // Join last message
      {
        $lookup: {
          from: "messages",
          localField: "_id",
          foreignField: "conversationId",
          as: "messages"
        }
      },

      // Only last message
      { $addFields: { lastMessage: { $last: "$messages" } } },

      // Check unread
      {
        $match: {
          "lastMessage.readBy": { $ne: userObjectId }
        }
      },

      // Return clean structure
      {
        $project: {
          _id: 1,
          participants: 1,
          lastMessage: {
            text: 1,
            from: 1,
            createdAt: 1
          }
        }
      }
    ]);

    return NextResponse.json(
      new ApiResponse(200, "Unread messages fetched", unread),
      { status: 200 }
    );

  } catch (err: any) {
    return NextResponse.json(
      new ApiResponse(500, err.message || "Server Error"),
      { status: 500 }
    );
  }
}
