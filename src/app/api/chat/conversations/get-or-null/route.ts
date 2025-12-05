import dbConnect from "@/database/dbConnection";
import Conversation from "@/models/conversation.model";
import { NextResponse } from "next/server";
import { ApiResponse } from "@/lib/ApiResponse";

export async function GET(req: Request) {
  try {
    await dbConnect();

    const url = new URL(req.url);
    const peerId = url.searchParams.get("peerId");
    const userId = req.headers.get("x-user-id");

    if (!peerId || !userId) {
      return NextResponse.json(new ApiResponse(400, "Missing userId or peerId"));
    }

    const convo = await Conversation.findOne({
      members: { $all: [userId, peerId] },
    });

    return NextResponse.json(
      new ApiResponse(200, "Conversation found", convo || null)
    );

  } catch (error: any) {
    console.error(error);
    return NextResponse.json(new ApiResponse(500, "Error", null));
  }
}
