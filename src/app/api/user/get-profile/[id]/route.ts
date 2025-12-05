import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/database/dbConnection";
import User from "@/models/user.model";
import { safeObjectId } from "@/helpers/ValidateMongooseId";
import { ApiResponse } from "@/lib/ApiResponse";

export async function GET( request: NextRequest, { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id: userId } = await params
    if (!userId) {
      return NextResponse.json(
        new ApiResponse(400, "Invalid user ID"),
        { status: 400 }
      );
    }

    const user = await User.findById(userId).select(
      "_id username profile_image"
    );

    if (!user) {
      return NextResponse.json(
        new ApiResponse(404, "User not found"),
        { status: 404 }
      );
    }

    return NextResponse.json(
      new ApiResponse(200, "User fetched successfully", user),
      { status: 200 }
    );
  } catch (error: any) {
    console.error("GET user profile error:", error);
    return NextResponse.json(
      new ApiResponse(500, "Server error"),
      { status: 500 }
    );
  }
}
