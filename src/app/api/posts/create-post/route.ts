import dbConnect from "@/database/dbConnection";
import User from "@/models/user.model"
import Post from "@/models/post.model";
import { ApiResponse } from "@/lib/ApiResponse";
import { NextResponse } from "next/server";
import cloudinary from "@/lib/Cloudinary";
import { safeObjectId } from "@/helpers/ValidateMongooseId";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const formData = await request.formData();
    const caption = formData.get("caption")?.toString();
    const file = formData.get("image") as File;
    const location = formData.get("location")?.toString() || ""
    const userId = request.headers.get("x-user-id")

    const validUserId = safeObjectId(userId as string)

    if (!validUserId || !file) {
      return NextResponse.json(
        new ApiResponse(400, "UserId and Post image is required"),
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

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "nextgen_uploads" },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.end(buffer);
    });

    const newPost = await Post.create({
      userId,
      caption,
      imageUrl: result.secure_url,
      location
    });

    return NextResponse.json(
      new ApiResponse(200, "Post created successfully", newPost)
    );
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      new ApiResponse(500, "Something went wrong while creating the post"),
      { status: 500 }
    );
  }
}
