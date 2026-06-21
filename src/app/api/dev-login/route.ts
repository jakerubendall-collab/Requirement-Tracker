import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildSessionCookie } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const role = req.nextUrl.searchParams.get("role") ?? "SELLER";
  const email = req.nextUrl.searchParams.get("email");

  let user;
  if (email) {
    user = await prisma.user.findUnique({ where: { email } });
  } else {
    user = await prisma.user.findFirst({ where: { role: role as "BROKER" | "SELLER" } });
  }

  if (!user) return NextResponse.redirect(new URL("/login?error=no-user", req.url));

  const session = { userId: user.id, email: user.email, name: user.name, role: user.role as "BROKER" | "SELLER" };
  const destination = role === "BROKER" ? "/broker/dashboard" : "/client/dashboard";
  const res = NextResponse.redirect(new URL(destination, req.url));
  res.headers.set("Set-Cookie", buildSessionCookie(session));
  return res;
}
