import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateMagicLink } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user) {
    return NextResponse.json({ ok: true });
  }

  const link = await generateMagicLink(user.email);

  console.log(`\n🔗 Magic link for ${user.email}:\n${link}\n`);

  return NextResponse.json({ ok: true, devLink: process.env.NODE_ENV !== "production" ? link : undefined });
}
