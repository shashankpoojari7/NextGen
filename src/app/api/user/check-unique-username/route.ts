import dbConnect from "@/database/dbConnection";
import { ApiResponse } from "@/lib/ApiResponse";
import User from "@/models/user.model";
import { usernameSchema } from "@/schemas/signUpSchemas";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  await dbConnect();
  try {
    const searchParams = request.nextUrl.searchParams
    const username = searchParams.get('username')
    console.log(username)
  
    const result = usernameSchema.safeParse({username});
    console.log(result)

    if(!result.success) {
      const usernameErrors = result.error.format().username?._errors || [];
      return Response.json(
        {
          success: false,
          message:
            usernameErrors?.length > 0
              ? usernameErrors.join(', ')
              : 'Invalid query parameters',
        },
        { status: 400 }
      );
    }

    const isUnique = await User.findOne({username: result?.data})

    if(!isUnique) {
      return NextResponse.json(
        new ApiResponse(409, "Username already taken. Try another."),
        { status: 409 }
      )
    }

    return NextResponse.json(
        new ApiResponse(200, "Username is available."),
        { status: 200 }
      )

  } catch (error: any) {
    console.error('Error checking username:', error);
    return Response.json(
      {
        success: false,
        message: 'Error checking username',
      },
      { status: 500 }
    );
  }
}