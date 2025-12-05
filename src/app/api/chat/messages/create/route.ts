import dbConnect from "@/database/dbConnection";
import Message from "@/models/message.model";
import Conversation from "@/models/conversation.model";
import { NextResponse } from "next/server";
import { ApiResponse } from "@/lib/ApiResponse";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { conversationId, from, to, text } = await request.json();

    if (!conversationId || !from || !to || !text) {
      return NextResponse.json(new ApiResponse(400, "Missing fields"), { status: 400 });
    }

    // Save message
    const saved = await Message.create({
      conversationId,
      senderId: from,
      receiverId: to,
      content: text
    });

    // Update last message (updatedAt auto refreshes)
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: text
    });

    return NextResponse.json(
      new ApiResponse(200, "Message saved", saved),
      { status: 200 }
    );

  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      new ApiResponse(500, "Message save failed", e.message),
      { status: 500 }
    );
  }
}
