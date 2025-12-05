import dbConnect from "@/database/dbConnection";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/ApiResponse";
import cloudinary, { extractPublicId } from "@/lib/Cloudinary";
import User from "@/models/user.model";

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();

    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        new ApiResponse(401, "Unauthorized: Missing x-user-id header"),
        { status: 401 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        new ApiResponse(404, "User not found"),
        { status: 404 }
      );
    }

    if (!user.profile_image) {
      return NextResponse.json(
        new ApiResponse(400, "User does not have a profile image to delete"),
        { status: 400 }
      );
    }

    const public_id = extractPublicId(user.profile_image);

    if (!public_id) {
      return NextResponse.json(
        new ApiResponse(400, "No profile image found to delete"),
        { status: 400 }
      );
    }

    console.log("Deleting Cloudinary Image:", public_id);

    const cloudinaryRes = await cloudinary.uploader.destroy(public_id);

    if (cloudinaryRes.result !== "ok") {
      return NextResponse.json(
        new ApiResponse(500, "Failed to delete image from Cloudinary"),
        { status: 500 }
      );
    }

    user.profile_image = "";
    await user.save();

    return NextResponse.json(
      new ApiResponse(200, "Profile picture deleted successfully"),
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Remove profile Error:", error);
    return NextResponse.json(
      new ApiResponse(500, "Error in remove profile", error?.message || error),
      { status: 500 }
    );
  }
}
