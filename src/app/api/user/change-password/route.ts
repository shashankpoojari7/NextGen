import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/ApiResponse";
import User from "@/models/user.model";
import mongoose from "mongoose";


export async function PATCH(request: NextRequest) {
  
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      new ApiResponse(400, "Invalid or missing JSON body"),
      { status: 400 }
    );
  }

  try {
    const { oldPassword, newPassword } = body;
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        new ApiResponse(400, "Unauthorized: Missing user ID header."),
        { status: 400 }
      );
    }

    if (!mongoose.isValidObjectId(userId)) {
      return NextResponse.json(
        new ApiResponse(400, "Invalid userId"),
        { status: 400 }
      );
    }

    if(!oldPassword || !newPassword) {
      return NextResponse.json(
        new ApiResponse(400, "Old password and New Password are Required."),
        { status: 400 }
      );
    }

    if(oldPassword === newPassword) {
      return NextResponse.json(
        new ApiResponse(400, "New password is same as Old Password"),
        { status: 400 }
      )
    }

    const user = await User.findById(userId)
    
    if(!user) {
      return NextResponse.json(
        new ApiResponse(404, "User not found"),
        { status: 404 }
      )
    }

    const isValid = await user.isPasswordCorrect(oldPassword);

    if(!isValid) {
      return NextResponse.json(
        new ApiResponse(401, "Incorrect Old password"),
        { status: 401 }
      )
    }

    user.password = newPassword
    await user.save()

    return NextResponse.json(
      new ApiResponse(200, "Password changed Successfully."),
      { status: 200 }
    )

  } catch (error: any) {
    console.error("Login Error:", error);
    return NextResponse.json(
      new ApiResponse(500, "Something went wrong, Password change failed."),
      { status: 500 }
    );
  }


}