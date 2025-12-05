import dbConnect from "@/database/dbConnection";
import { ApiResponse } from "@/lib/ApiResponse";
import User from "@/models/user.model";
import { usernameSchema } from "@/schemas/signUpSchemas";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  await dbConnect();
  try {
    const { username } = await params

    const result = usernameSchema.safeParse(username);

    if(!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.error.issues[0].message || "Invalid username"
        },
        { status: 400 }
      );
    }

    const isUnique = await User.findOne({username: result?.data.trim().toLowerCase()})

    if(isUnique) {
      return NextResponse.json(
        new ApiResponse(409, "Username already taken. Try another."),
        { status: 409 }
      )
    } else {
      return NextResponse.json(
        new ApiResponse(200, "Username is available."),
        { status: 200 }
      )
    }

  } catch (error: any) {
    console.error('Error checking username:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error checking username',
      },
      { status: 500 }
    );
  }
}