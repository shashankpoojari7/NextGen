import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/database/dbConnection";
import User from "@/models/user.model";
import { ApiResponse } from "@/lib/ApiResponse";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json(
        new ApiResponse(401, "Unauthorized access"),
        { status: 401 }
      );
    }

    const user = await User.findById(userId).select(
      "username fullname bio profile_image"
    );

    if (!user) {
      return NextResponse.json(
        new ApiResponse(404, "User not found"),
        { status: 404 }
      );
    }

    return NextResponse.json(
      new ApiResponse(200, "Profile fetched successfully", user),
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      new ApiResponse(500, "Server error", error.message),
      { status: 500 }
    );
  }
}
