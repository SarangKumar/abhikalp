import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

import { AUTH_ROUTES, PROTECTED_ROUTES } from "@/lib/routes";

// Next 16 "proxy" (formerly middleware). Cheap cookie/JWT check only;
// pages still load the user from the DB themselves.
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isAuth = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (!token && isProtected) {
    const url = new URL("/auth/sign-in", request.url);
    url.searchParams.set("callbackUrl", pathname + search);
    return NextResponse.redirect(url);
  }

  if (token && isAuth) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*", "/test/:path*"],
};
