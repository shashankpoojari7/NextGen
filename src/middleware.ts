import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { ApiResponse } from "@/lib/ApiResponse";

const publicRoutes = ["/sign-in", "/sign-up"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isPublic = publicRoutes.includes(pathname);
  console.log("isPublic:", isPublic, "pathname:", pathname, "token:", !!token);


  if (!token) {
    if (isPublic) {
      return NextResponse.next();
    }

    const signInUrl = new URL("/sign-in", req.url);
    return NextResponse.redirect(signInUrl);
  }

  if (isPublic && pathname !== "/") {
    const dashboardUrl = new URL("/dashboard", req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  if (pathname.startsWith("/api")) {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id", String(token._id));
    requestHeaders.set("x-user-email", String(token.email));
    requestHeaders.set("x-username", String(token.username || ""));
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api/auth).*)"], 
};
