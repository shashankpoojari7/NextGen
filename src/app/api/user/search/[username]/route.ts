import dbConnect from "@/database/dbConnection";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/ApiResponse";
import User from "@/models/user.model";

export async function GET(request: NextRequest, { params }: { params: { username: string } }) 
{
  try {
    await dbConnect();

    const { username } = await params;

    const users = await User.find({
      $or: [
        { username: { $regex: username, $options: "i" } },
        { fullname: { $regex: username, $options: "i" } },
      ],
    }).select("username profile_image _id"); 

    return NextResponse.json(
      new ApiResponse(200, "Users fetched successfully", users),
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch User Error:", error);
    return NextResponse.json(
      new ApiResponse(500, "Something went wrong while fetching users"),
      { status: 500 }
    );
  }
}
