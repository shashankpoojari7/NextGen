import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/ApiResponse";
import dbConnect from "@/database/dbConnection";
import Notification from "@/models/notification.model";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(new ApiResponse(400, "Invalid UserId"), { status: 400 });
    }

    const notifications = await Notification.aggregate([
      // MATCH recipient
      {
        $match: {
          $expr: {
            $eq: [
              "$recipient",
              {
                $convert: {
                  input: userId,
                  to: "objectId",
                  onError: null,
                  onNull: null
                }
              }
            ]
          }
        }
      },

      // JOIN ACTOR (user who triggered the notification)
      {
        $lookup: {
          from: "users",
          localField: "actor",
          foreignField: "_id",
          as: "actorInfo"
        }
      },
      { $unwind: "$actorInfo" },
      {
        $addFields: {
          entityObjectId: {
            $cond: [
              { $in: ["$type", ["LIKE", "COMMENT"]] },
              {
                $convert: {
                  input: "$entityId",
                  to: "objectId",
                  onError: null,
                  onNull: null
                }
              },
              null
            ]
          }
        }
      },
      {
        $lookup: {
          from: "posts",
          localField: "entityObjectId",
          foreignField: "_id",
          as: "postInfo"
        }
      },
      {
        $unwind: {
          path: "$postInfo",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "follows",
          let: { actorId: "$actor", recipientId: "$recipient", notifType: "$type" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$followerId", "$$actorId"] },
                    { $eq: ["$followingId", "$$recipientId"] },
                    { $eq: ["$isAccepted", false] },
                    { $eq: ["$$notifType", "FOLLOW_REQUEST"] }
                  ]
                }
              }
            }
          ],
          as: "followRequest"
        }
      },
      {
        $unwind: {
          path: "$followRequest",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          type: 1,
          createdAt: 1,
          isRead: 1,
          senderUsername: "$actorInfo.username",
          senderImage: "$actorInfo.profile_image",
          postPreview: "$postInfo.imageUrl",
          followRequestId: "$followRequest._id"
        }
      },

      { $sort: { createdAt: -1 } }
    ]);

    return NextResponse.json(
      new ApiResponse(200, "Notification fetched successfully.", notifications)
    );

  } catch (error: any) {
    console.error("Notification Error:", error);
    return NextResponse.json(
      new ApiResponse(500, "Something went wrong while fetching Notification"),
      { status: 500 }
    );
  }
}
