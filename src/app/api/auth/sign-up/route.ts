import dbConnect from "@/database/dbConnection";
import User from "@/models/user.model";
import { ApiResponse } from "@/lib/ApiResponse";
import { NextResponse } from "next/server";

export async function POST(request: Request) {

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
    await dbConnect();

    const { identifier, password, fullname, username, dob } = body || {};

    if (!username || !password || !fullname || !dob || !identifier) {
      return NextResponse.json(
        new ApiResponse(
          400,
          "Username, password, fullname, date of birth, and identifier are required"
        ),
        { status: 400 }
      );
    }

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const isMobile = /^\d{10}$/.test(identifier);

    if (!isEmail && !isMobile) {
      return NextResponse.json(
        new ApiResponse(400, "Please provide a valid email or 10-digit mobile number"),
        { status: 400 }
      );
    }

    const existingUser = await User.findOne(
      isEmail
        ? { email: identifier.trim().toLowerCase() }
        : { mobile: identifier.trim() }
    );

    if (existingUser) {
      if (existingUser.authProvider !== "credentials") {
        existingUser.password = password;
        existingUser.authProvider = "credentials";
        existingUser.fullname =  fullname.trim();
        existingUser.username =  username.trim();
        existingUser.dob = dob;
        await existingUser.save();

        const { password: _, ...safeUser } = existingUser.toObject();
        return NextResponse.json(
          new ApiResponse(200, "OAuth account linked with credentials", safeUser),
          { status: 200 }
        );
      }

      return NextResponse.json(
        new ApiResponse(409, `${isEmail ? "Email" : "Mobile number"} is already in use`),
        { status: 409 }
      );
    }

    const user = await User.create({
      username: username.trim(),
      fullname: fullname.trim(),
      email: isEmail ? identifier.trim().toLowerCase() : undefined,
      mobile: isMobile ? identifier.trim() : undefined,
      password,
      dob,
      authProvider: "credentials",
    });

    const { password: _, ...safeUser } = user.toObject();

    return NextResponse.json(
      new ApiResponse(201, "User registered successfully", safeUser),
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup Error:", error);
    return NextResponse.json(new ApiResponse(500, "Server error"), {
      status: 500,
    });
  }
}
