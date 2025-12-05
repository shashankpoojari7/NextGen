import dbConnect from "@/database/dbConnection";
import User from "@/models/user.model";
import Post from "@/models/post.model";
import { ApiResponse } from "@/lib/ApiResponse";
import { NextResponse } from "next/server";
import cloudinary from "@/lib/Cloudinary";
import { safeObjectId } from "@/helpers/ValidateMongooseId";
import { v4 as uuid } from "uuid";
import { Readable } from "stream";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const formData = await request.formData();
    const caption = formData.get("caption")?.toString() || "";
    const file = formData.get("image") as File | null;
    const location = formData.get("location")?.toString() || "";
    const userId = request.headers.get("x-user-id");

    const validUserId = safeObjectId(userId as string);

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

    // ⭐ Convert Web ReadableStream → Node Readable Stream
    const webStream = file.stream();
    const nodeStream = Readable.fromWeb(webStream as any);

    const postPublicId = `post_${uuid()}`;

    // ⭐ Upload to Cloudinary using upload_stream
    const cloudResult: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "nextgen/posts",
          public_id: postPublicId,
          overwrite: false,
          transformation: [
            { width: 1080, height: 1080, crop: "fill", gravity: "auto" },
          ],
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      // 🚀 PIPE NODE STREAM TO CLOUDINARY STREAM
      nodeStream.pipe(uploadStream);
    });

    // ⭐ Create post in database
    const newPost = await Post.create({
      userId,
      caption,
      imageUrl: cloudResult.secure_url,
      publicId: `nextgen/posts/${postPublicId}`,
      location,
    });

    return NextResponse.json(
      new ApiResponse(200, "Post created successfully", newPost)
    );
  } catch (error: any) {
    console.error("Upload Error:", error);
    return NextResponse.json(
      new ApiResponse(500, "Something went wrong while creating the post"),
      { status: 500 }
    );
  }
}
