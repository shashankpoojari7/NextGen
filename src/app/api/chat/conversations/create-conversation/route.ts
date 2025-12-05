import dbConnect from "@/database/dbConnection";
import Conversation from "@/models/conversation.model";
import Message from "@/models/message.model";
import { ApiResponse } from "@/lib/ApiResponse";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const { peerId, text } = await request.json();
    
    
    const userId = request.headers.get("x-user-id")
    console.log({peerId,text,userId});

    if (!userId || !peerId || !text) {
      return NextResponse.json(
        new ApiResponse(400, "userId, peerId, text are required"),
        { status: 400 }
      );
    }

    let conversation = await Conversation.findOne({
      members: { $all: [userId, peerId] }
    });

    if (conversation) {
      return NextResponse.json(
        new ApiResponse(200, "Conversation exists", { conversationId: conversation._id })
      );
    }

    conversation = await Conversation.create({
      members: [userId, peerId],
      lastMessage: text,
    });

    return NextResponse.json(
      new ApiResponse(200, "Conversation created", { conversationId: conversation._id })
    );

  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      new ApiResponse(500, "Error creating conversation", error.message),
      { status: 500 }
    );
  }
}
