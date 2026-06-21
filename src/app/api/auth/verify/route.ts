import { NextRequest, NextResponse } from "next/server";
import { verifyMagicLink, buildSessionCookie } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/login?error=invalid", req.url));
  }

  const session = await verifyMagicLink(token);
  if (!session) {
    return NextResponse.redirect(new URL("/login?error=expired", req.url));
  }

  const destination = session.role === "BROKER" ? "/broker/dashboard" : "/client/dashboard";
  const res = NextResponse.redirect(new URL(destination, req.url));
  res.headers.set("Set-Cookie", buildSessionCookie(session));
  return res;
}
