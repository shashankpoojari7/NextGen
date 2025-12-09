import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { ApiResponse } from "@/lib/ApiResponse";
import User from "@/models/user.model";

export async function PATCH(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        new ApiResponse(400, "Unauthorized: Missing user ID header."),
        { status: 400 }
      );
    }

    if (!mongoose.isValidObjectId(userId)) {
      return NextResponse.json(
        new ApiResponse(400, "Invalid userId"),
        { status: 400 }
      );
    }

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        new ApiResponse(404, "User not found"),
        { status: 404 }
      );
    }

    // 🚀 Toggle logic — no body required
    const newPrivacyValue = !user.isPrivate;
    user.isPrivate = newPrivacyValue;

    await user.save();

    return NextResponse.json(
      new ApiResponse(
        200,
        `Account privacy updated: ${newPrivacyValue ? "Private" : "Public"}`,
        { isPrivate: newPrivacyValue }
      ),
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Privacy Toggle Error:", error);
    return NextResponse.json(
      new ApiResponse(500, "Something went wrong while updating privacy."),
      { status: 500 }
    );
  }
}
