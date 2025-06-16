import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  console.log("Middleware - Request URL:", request.url);
  console.log("Middleware - Pathname:", request.nextUrl.pathname);

  // Just log and continue - no blocking
  return NextResponse.next();
}

export const config = {
  matcher: ["/checkout/:path*", "/cart/:path*"],
};
