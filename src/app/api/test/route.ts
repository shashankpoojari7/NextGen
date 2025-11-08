import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from "@/lib/ApiResponse";
import dbConnect from '@/database/dbConnection';
import { getToken } from "next-auth/jwt";

export async function GET(request: NextRequest) {
  await dbConnect()
  const userId = request.headers.get("x-user-id")
  const email = request.headers.get("x-user-email")
  const username = request.headers.get("x-username")
  
  if (!userId) {
    return NextResponse.json({ error: " user id not found" }, { status: 401 });
  }
  
  return NextResponse.json({message:"user found", userId, email, username }, { status: 200 });

}