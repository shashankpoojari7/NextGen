import { NextResponse } from "next/server";
import dbConnect from "@/database/dbConnection";
import Message from "@/models/message.model";
import { ApiResponse } from "@/lib/ApiResponse";
import { safeObjectId } from "@/helpers/ValidateMongooseId";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    await dbConnect();
    const userId = request.headers.get("x-user-id");

    if (!userId || !safeObjectId(userId)) {
      return NextResponse.json(new ApiResponse(401, "User not authenticated"), { status: 401 });
    }

    const { conversationId } = await params;

    if (!conversationId) {
      return NextResponse.json(
        new ApiResponse(400, "Conversation ID missing"),
        { status: 400 }
      );
    }
    
    // 1. Fetch All Messages (Newest first)
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: -1 }) // Newest first for flex-col-reverse UI
      .lean();

    // 2. Count Unread Messages received by the current user
    const unreadCount = await Message.countDocuments({
      conversationId: conversationId,
      receiverId: userId,
      isRead: false,
    });
    
    // 3. Mark all received messages in this conversation as read (Non-blocking)
    // This action ensures the unread count becomes 0 after the messages are loaded.
    if (unreadCount > 0) {
        Message.updateMany(
            { conversationId: conversationId, receiverId: userId, isRead: false },
            { $set: { isRead: true, readAt: new Date() } }
        ).catch(err => console.error("Error marking messages as read:", err));
    }

    // 4. Return the data in the expected format
    const responseData = {
        messages: messages,
        unreadCount: unreadCount,
    }

    return NextResponse.json(
      new ApiResponse(200, "Messages fetched successfully", responseData),
      { status: 200 }
    );

  } catch (error: any) {
    console.error("GET Messages Error:", error);
    return NextResponse.json(
      new ApiResponse(500, "Failed to fetch messages", error.message),
      { status: 500 }
    );
  }
}