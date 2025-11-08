import dbConnect from "@/database/dbConnection";
import User from "@/models/user.model";
import { ApiResponse } from "@/lib/ApiResponse";
import { NextResponse } from "next/server";
import { GenerateAccessToken } from "@/lib/jwt";

export async function POST(request: Request) {
  await dbConnect();

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      new ApiResponse(400, "Invalid or missing JSON body"),
      { status: 400 }
    );
  }

  const { identifier, password } = body || {};

  if (!identifier || !password) {
    return NextResponse.json(
      new ApiResponse(400, "Email or mobile and password are required"),
      { status: 400 }
    );
  }

  try {
    const query: any = identifier.includes("@")
      ? { email: identifier.trim().toLowerCase() }
      : { mobile: identifier.trim() };

    const user = await User.findOne(query);
    console.log("user",user)
    if (!user) {
      return NextResponse.json(
        new ApiResponse(404, "User not found"),
        { status: 404 }
      );
    } 
    console.log("password", user.password)
    if (user.authProvider !== "credentials") {
      return NextResponse.json(
        new ApiResponse(
          400,
          `Please log in using your ${user.authProvider} account`
        ),
        { status: 400 }
      );
    }

    const isValid = await user.isPasswordCorrect(password);
    if (!isValid) {
      return NextResponse.json(
        new ApiResponse(401, "Invalid credentials"),
        { status: 401 }
      );
    }

    const userData = {
      _id: user._id,
      email: user.email,
      mobile: user.mobile,
      username: user.username,
      fullname: user.fullname,
      dob: user.dob,
      bio: user.bio,
      profile_image: user.profile_image,
      isPrivate: user.isPrivate,
      followersCount: user.followersCount,
      followingCount: user.followingCount,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    const token = GenerateAccessToken({
      _id: user._id.toString(),
      username: user.username,
    });

    const response = NextResponse.json(
      new ApiResponse(200, "Login successful", userData),
      { status: 200 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 10,
    });

    return response;
  } catch (error: any) {
    console.error("Login Error:", error);
    return NextResponse.json(
      new ApiResponse(500, "Something went, Login failed."),
      { status: 500 }
    );
  }
}
