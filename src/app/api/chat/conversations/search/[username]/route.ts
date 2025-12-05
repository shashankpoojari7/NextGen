import dbConnect from "@/database/dbConnection";
import User from "@/models/user.model";
import { ApiResponse } from "@/lib/ApiResponse";
import { NextResponse } from "next/server";
import { safeObjectId } from "@/helpers/ValidateMongooseId";
import Follow from "@/models/follow.model";
import mongoose from "mongoose";

export async function GET(request: Request, { params }: { params: Promise<{ username: string }> }) {
  try {
    await dbConnect();

    const userId = request.headers.get("x-user-id");
    const validUserId = safeObjectId(userId as string);

    if (!validUserId) {
      return NextResponse.json(
        new ApiResponse(400, "UserId is Invalid"), 
        { status: 400 }
      );
    }


    const { username: rawSearch} = await params
    const search = typeof rawSearch === "string" ? rawSearch.trim() : "";

    if (!search) {
      return NextResponse.json(
        new ApiResponse(200, "Empty search", [])
      );
    }

    const followedUsers = await Follow.aggregate([
      {
        $match: {
          followerId: validUserId,
          isAccepted: true
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "followingId",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $match: {
          $or: [
            { "user.username": { $regex: search, $options: "i" } },
            { "user.fullname": { $regex: search, $options: "i" } }
          ]
        }
      },
      {
        $project: {
          _id: "$user._id",
          username: "$user.username",
          profile_image: "$user.profile_image"
        }
      }
    ]);

    const followedIds = followedUsers.map((u: any) => u._id);

    const nonFollowedUsers = await User.find({
      _id: { $nin: [...followedIds, validUserId] },
      $or: [
        { username: { $regex: search, $options: "i" } },
        { fullname: { $regex: search, $options: "i" } }
      ]
    })
      .select("_id username fullname profile_image")
      .lean();

    const searchResults = [...followedUsers, ...nonFollowedUsers];

    return NextResponse.json(
      new ApiResponse(200, "Conversation search fetched successfully.", searchResults),
      { status: 200 }
    );

  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      new ApiResponse(500, "Error in Conversation Search", error?.message || error),
      { status: 500 }
    );
  }
}
