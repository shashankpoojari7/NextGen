import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/ApiResponse";
import mongoose from "mongoose";
import dbConnect from "@/database/dbConnection";
import User from "@/models/user.model";
import { safeObjectId } from "@/helpers/ValidateMongooseId";
import { profile } from "console";

export async function GET(request: NextRequest, { params }: { params: { username: string } }) {
  try {
    await dbConnect();

    const { username } = await params;
    const userId = request.headers.get("x-user-id") 
    const validUserId = safeObjectId(userId as string)

    if(!validUserId) {
      return NextResponse.json(
        new ApiResponse(400, "Missing parameter: UserId"),
        { status: 500 }
      );
    }

    const user_profile = await User.aggregate(
    [
      {
        $match: { username },
      },
      {
        $lookup: {
          from: "posts",
          localField: "_id",
          foreignField: "userId",
          as: "posts",
        },
      },
      {
        $lookup: {
          from: "follows",
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$followingId", "$$userId"] },
                    { $eq: ["$isAccepted", true] },
                  ],
                },
              },
            },
          ],
          as: "followersAccepted",
        },
      },
      {
        $lookup: {
          from: "follows",
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$followerId", "$$userId"] },
                    { $eq: ["$isAccepted", true] },
                  ],
                },
              },
            },
          ],
          as: "followingsAccepted",
        },
      },
      {
        $lookup: {
          from: "follows",
          let: {profileId :"$_id"},
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$followerId", new mongoose.Types.ObjectId(validUserId)] },
                    { $eq: ["$followingId", "$$profileId"] },
                    { $eq: ["$isAccepted", false] }
                  ]
                }
              }
            }
          ],
          as: "isRequested"
        }
      },
      {
        $lookup: {
          from: "follows",
          let: { profileId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$followerId", "$$profileId"] },
                    { $eq: ["$followingId",  new mongoose.Types.ObjectId(validUserId)] },
                    { $eq: ["$isAccepted", false] }
                  ]
                }
              }
            }
          ],
          as: "hasRequestedToMe"
        }
      },
      {
        $lookup: {
          from: "follows",
          let: {profileId: "$_id"},
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$followerId", "$$profileId"]},
                    { $eq: ["$followingId",  new mongoose.Types.ObjectId(validUserId)] },
                    { $eq: ["$isAccepted", true] }
                  ]
                }
              }
            }
          ],
          as: "isFollowingMe"
        }
      },
      {
        $lookup: {
          from: "follows",
          let: {profileId: "$_id"},
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$followerId", new mongoose.Types.ObjectId(validUserId)] },
                    { $eq: ["$followingId", "$$profileId"] },
                    { $eq: ["$isAccepted", true] }
                  ]
                }
              }
            }
          ],
          as: "isFollowing"
        }
      },
      {
        $addFields: {
          followersCount: { $size: "$followersAccepted" },
          followingCount: { $size: "$followingsAccepted" },
          postsCount: { $size: "$posts"},
          isRequested: { $gt: [ { $size: "$isRequested" }, 0 ] },
          hasRequestedToMe: { $gt: [ { $size: "$hasRequestedToMe" }, 0 ] },
          isFollowing: { $gt: [ { $size: "$isFollowing" }, 0 ] },
          isFollowingMe: { $gt: [ { $size: "$isFollowingMe" }, 0 ] }
        },
      },
      {
        $project: {
          _id: 1,
          username: 1,
          fullname: 1,
          bio: 1,
          profile_image: 1,
          isPrivate: 1,
          followersCount: 1,
          followingCount: 1,
          isRequested: 1,
          hasRequestedToMe: 1,
          isFollowing: 1,
          isFollowingMe: 1,
          postsCount: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
      {
        $addFields: {
          posts: {
            $sortArray: { input: "$posts", sortBy: { createdAt: -1 } },
          },
        },
      },
    ]);

    if (user_profile.length === 0) {
      return NextResponse.json(
        new ApiResponse(400, "User not found"),
        { status: 400 }
      );
    }

    return NextResponse.json(
      new ApiResponse(200, "User profile fetched successfully", user_profile),
      { status: 200 }
    );
  } catch (error: any) {
    console.error("User Profile Error:", error);
    return NextResponse.json(
      new ApiResponse(500, "Something went wrong while fetching user profile"),
      { status: 500 }
    );
  }
}
