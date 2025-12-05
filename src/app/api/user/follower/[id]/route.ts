import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/ApiResponse";
import dbConnect from "@/database/dbConnection";
import Follow from "@/models/follow.model";
import { safeObjectId } from "@/helpers/ValidateMongooseId";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();

    const { id: profileId } = await params;
    const userId = request.headers.get("x-user-id");

    const validUserId = safeObjectId(userId as string);
    const validProfileId = safeObjectId(profileId as string);

    if (!validUserId || !validProfileId) {
      return NextResponse.json(
        new ApiResponse(400, "Missing parameter: UserId, ProfileId"),
        { status: 500 }
      );
    }

    let followerList;

    if (userId === profileId) {
      followerList = await Follow.aggregate([
        {
          $match: {
            followingId: validProfileId,
            isAccepted: true,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "followerId",
            foreignField: "_id",
            as: "user",
            pipeline: [{ $project: { username: 1, profile_image: 1 } }],
          },
        },
        { $unwind: "$user" },
        { $replaceRoot: { newRoot: "$user" } },
      ]);
    }

    // -----------------------
    // ⭐ CASE 2: Viewing someone else's followers
    // -----------------------
    else {
      followerList = await Follow.aggregate([
        {
          $match: { followingId: validProfileId, isAccepted: true },
        },

        // → The person who follows the profile
        {
          $lookup: {
            from: "users",
            localField: "followerId",
            foreignField: "_id",
            as: "user",
            pipeline: [
              { $project: { username: 1, profile_image: 1, isPrivate: 1 } },
            ],
          },
        },
        { $unwind: "$user" },

        // -> Are YOU following them?
        {
          $lookup: {
            from: "follows",
            let: { target: "$followerId" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$followerId", validUserId] },
                      { $eq: ["$followingId", "$$target"] },
                      { $eq: ["$isAccepted", true] },
                    ],
                  },
                },
              },
            ],
            as: "isFollowing",
          },
        },

        // -> Have YOU requested to follow them?
        {
          $lookup: {
            from: "follows",
            let: { target: "$followerId" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$followerId", validUserId] },
                      { $eq: ["$followingId", "$$target"] },
                      { $eq: ["$isAccepted", false] },
                    ],
                  },
                },
              },
            ],
            as: "isRequested",
          },
        },

        // -> Are THEY following you?
        {
          $lookup: {
            from: "follows",
            let: { target: "$followerId" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$followerId", "$$target"] },
                      { $eq: ["$followingId", validUserId] },
                      { $eq: ["$isAccepted", true] },
                    ],
                  },
                },
              },
            ],
            as: "isFollowingMe",
          },
        },

        // -> Have THEY requested to follow you?
        {
          $lookup: {
            from: "follows",
            let: { target: "$followerId" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$followerId", "$$target"] },
                      { $eq: ["$followingId", validUserId] },
                      { $eq: ["$isAccepted", false] },
                    ],
                  },
                },
              },
            ],
            as: "hasRequestedToMe",
          },
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
            hasRequestedToMe: { $gt: [{ $size: "$hasRequestedToMe" }, 0] },
          },
        },
      ]);
    }

    return NextResponse.json(
      new ApiResponse(200, "Follower List:", followerList),
      { status: 200 }
    );
  } catch (error) {
    console.error("Follower List Error:", error);
    return NextResponse.json(
      new ApiResponse(500, "Something went wrong while fetching follower list"),
      { status: 500 }
    );
  }
}
