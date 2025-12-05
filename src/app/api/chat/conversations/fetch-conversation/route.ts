import dbConnect from "@/database/dbConnection";
import Conversation from "@/models/conversation.model";
import { ApiResponse } from "@/lib/ApiResponse";
import { NextRequest, NextResponse } from "next/server";
import { safeObjectId } from "@/helpers/ValidateMongooseId";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get the current user's ID from headers
    const userId = request.headers.get("x-user-id");
    const validUserId = safeObjectId(userId as string);

    if (!validUserId) {
      return NextResponse.json(
        new ApiResponse(401, "UserId invalid or missing"),
        { status: 401 }
      );
    }

    const validUserIdString = validUserId.toString();
    const userObjId = new mongoose.Types.ObjectId(validUserIdString);

    // Aggregation pipeline to fetch conversations, peer info, last message, and unread count
    const conversationList = await Conversation.aggregate([
      // Match conversations where the user is a member
      {
        $match: {
          members: { $in: [validUserIdString] }
        }
      },

      // Determine the peerId
      {
        $addFields: {
          peerId: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$members",
                  cond: { $ne: ["$$this", validUserIdString] }
                }
              },
              0
            ]
          }
        }
      },

      // Convert peerId string to ObjectId for lookup
      {
        $addFields: {
          peerObjId: { $toObjectId: "$peerId" }
        }
      },

      // Lookup peer user details
      {
        $lookup: {
          from: "users",
          localField: "peerObjId",
          foreignField: "_id",
          as: "peer"
        }
      },
      { $unwind: "$peer" },

      // Lookup unread messages for the current user in this conversation
      {
        $lookup: {
          from: "messages",
          let: { convoId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    // Match messages belonging to this conversation
                    { $eq: ["$conversationId", { $toString: "$$convoId" }] },
                    // Match messages received by the current user
                    { $eq: ["$receiverId", validUserIdString] },
                    // Match messages that are NOT read
                    { $eq: ["$isRead", false] }
                  ]
                }
              }
            }
          ],
          as: "unreadMessages"
        }
      },

      // Calculate the size of the unreadMessages array
      {
        $addFields: {
          unreadCount: { $size: "$unreadMessages" }
        }
      },

      // Project the final fields
      {
        $project: {
          _id: 0,
          conversationId: "$_id",
          peerId: 1,
          username: "$peer.username",
          profile_image: "$peer.profile_image",
          lastMessage: 1,
          updatedAt: 1,
          createdAt: 1,
          unreadCount: 1
        }
      },

      // Sort by the last activity date (updatedAt)
      { $sort: { updatedAt: -1 } }
    ]);

    return NextResponse.json(
      new ApiResponse(200, "Conversations fetched successfully", conversationList),
      { status: 200 }
    );

  } catch (err: any) {
    console.error("Conversation List Error:", err);
    return NextResponse.json(
      new ApiResponse(500, "Server error", err?.message),
      { status: 500 }
    );
  }
}