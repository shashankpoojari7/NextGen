import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const publicRoutes = ["/sign-in", "/sign-up"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/_next/image") || 
    pathname.startsWith("/_next/static") ||
    pathname.startsWith("/favicon") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".svg")
  ) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isPublic = publicRoutes.includes(pathname);

  if (!token) {
    if (isPublic) {
      return NextResponse.next();
    }

    const signInUrl = new URL("/sign-in", req.url);
    return NextResponse.redirect(signInUrl);
  }

  if (isPublic && pathname !== "/") {
    const homeUrl = new URL("/", req.url);
    return NextResponse.redirect(homeUrl);
  }

  if (pathname.startsWith("/api")) {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id", String(token.id));
    requestHeaders.set("x-user-email", String(token.email));
    requestHeaders.set("x-username", String(token.username || ""));
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  return NextResponse.next();
}

// export const config = {
//   matcher: ["/((?!_next|api/auth).*)"], 
//   runtime: "nodejs"
// };
export const config = {
  matcher: [
    '/((?!api/user/check-unique-username|api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
