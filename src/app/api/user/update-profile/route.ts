import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/ApiResponse";
import dbConnect from "@/database/dbConnection";
import User from "@/models/user.model";
import { safeObjectId } from "@/helpers/ValidateMongooseId";
import { updateProfile } from "@/schemas/signUpSchemas";
import cloudinary from "@/lib/Cloudinary";
import { deleteCloudinaryImage } from "@/helpers/deleteCloudinaryImage";

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId || !safeObjectId(userId)) {
      return NextResponse.json(
        new ApiResponse(400, "Invalid or missing userId header"),
        { status: 400 }
      );
    }

    await dbConnect();

    const formData = await request.formData();
    const username = formData.get("username")?.toString() || "";
    const fullname = formData.get("fullname")?.toString() || "";
    const bio = formData.get("bio")?.toString() || "";
    const image = formData.get("image") as File | null;

    const validation = updateProfile.safeParse({ username, fullname, bio });
    if (!validation.success) {
      const message =
        validation.error.issues[0]?.message || "Invalid input data";
      return NextResponse.json(new ApiResponse(400, message), { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(new ApiResponse(404, "User not found"), {
        status: 404,
      });
    }

    let imageUrl = user.profile_image;

    if (image && image.size > 0) {
      const previousPublicId = `nextgen/profiles/user_${userId}`;
      await deleteCloudinaryImage(previousPublicId);

      const buffer = Buffer.from(await image.arrayBuffer());

      const result = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "nextgen/profiles",
            public_id: `user_${userId}`,
            overwrite: true,
            transformation: [
              { width: 512, height: 512, crop: "fill", gravity: "auto" },
            ],
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(buffer);
      });

      imageUrl = result.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          username,
          fullname,
          bio,
          profile_image: imageUrl,
        },
      },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json(
        new ApiResponse(404, "User not found after update"),
        { status: 404 }
      );
    }

    return NextResponse.json(
      new ApiResponse(200, "Profile updated successfully", updatedUser),
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in update-profile route:", error);
    return NextResponse.json(
      new ApiResponse(500, "Something went wrong || update-profile"),
      { status: 500 }
    );
  }
}
