import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/ApiResponse";
import mongoose from "mongoose";
import dbConnect from "@/database/dbConnection";
import User from "@/models/user.model";
import { safeObjectId } from "@/helpers/ValidateMongooseId";
import { profile } from "console";
import Follow from "@/models/follow.model";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();

    const { id: profileId } = await params;
    const userId = request.headers.get("x-user-id") 
    const validUserId = safeObjectId(userId as string)
    const validProfileId = safeObjectId(profileId as string)
    
    if(!validUserId || !validProfileId) {
      return NextResponse.json(
        new ApiResponse(400, "Missing parameter: UserId, ProfileId"),
        { status: 500 }
      );
    }

    let followingList;

    if(userId === profileId) {
      followingList = await Follow.aggregate([
        {
          $match: {
            followerId: validProfileId,
            isAccepted: true,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "followingId",
            foreignField: "_id",
            as: "user",
            pipeline: [
              { $project: { username: 1, profile_image: 1 } }
            ]
          }
        },
        { $unwind: "$user" },
        { $replaceRoot: { newRoot: "$user" } }
      ]);

    } else {
      followingList = await Follow.aggregate([
        {
          $match: { followerId: validProfileId, isAccepted: true }
        },

        {
          $lookup: {
            from: "users",
            localField: "followingId",
            foreignField: "_id",
            as: "user",
            pipeline: [
              { $project: { username: 1, profile_image: 1, isPrivate: 1 } }
            ]
          }
        },
        { $unwind: "$user" },
        {
          $lookup: {
            from: "follows",
            let: { target: "$followingId" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$followerId", validUserId] },
                      { $eq: ["$followingId", "$$target"] },
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
          $lookup: {
            from: "follows",
            let: { target: "$followingId" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$followerId", validUserId] },
                      { $eq: ["$followingId", "$$target"] },
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
            let: { target: "$followingId" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$followerId", "$$target"] },
                      { $eq: ["$followingId", validUserId] },
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
            let: { target: "$followingId" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$followerId", "$$target"] },
                      { $eq: ["$followingId", validUserId] },
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
          $project: {
            _id: "$user._id",
            username: "$user.username",
            profile_image: "$user.profile_image",
            isPrivate: "$user.isPrivate",

            isFollowing: { $gt: [{ $size: "$isFollowing" }, 0] },
            isRequested: { $gt: [{ $size: "$isRequested" }, 0] },
            isFollowingMe: { $gt: [{ $size: "$isFollowingMe" }, 0] },
            hasRequestedToMe: { $gt: [{ $size: "$hasRequestedToMe" }, 0] }
          }
        }
      ]);
    }

    return NextResponse.json(
      new ApiResponse(200, "Following List:", followingList),
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
