import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  if (pathname === "/dashboard/errors") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard/errors/list";
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/errors"],
};
