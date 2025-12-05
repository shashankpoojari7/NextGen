import { NextResponse } from "next/server";
import dbConnect from "@/database/dbConnection";
import Message from "@/models/message.model";
import { ApiResponse } from "@/lib/ApiResponse";
import { safeObjectId } from "@/helpers/ValidateMongooseId";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ conversationId: string }>  }
) {
  try {
    await dbConnect();
    // Get the User ID from the request headers
    const userId = request.headers.get("x-user-id");
    
    // Get the conversationId from the URL parameters
    const { conversationId } = await params;

    if (!userId || !safeObjectId(userId)) {
      return NextResponse.json(new ApiResponse(401, "User not authenticated or invalid ID"), { status: 401 });
    }

    if (!conversationId) {
      return NextResponse.json(new ApiResponse(400, "Conversation ID missing in path"), { status: 400 });
    }

    // Mark all unread messages received by the current user in this conversation as read
    const result = await Message.updateMany(
        { 
            conversationId: conversationId, 
            receiverId: userId, 
            isRead: false 
        },
        { 
            $set: { isRead: true, readAt: new Date() } 
        }
    );

    return NextResponse.json(
      new ApiResponse(200, `${result.modifiedCount} messages marked as read`),
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Mark Read Error:", error);
    return NextResponse.json(
      new ApiResponse(500, "Failed to mark messages as read", error.message),
      { status: 500 }
    );
  }
}