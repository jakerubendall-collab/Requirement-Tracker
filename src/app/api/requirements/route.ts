import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "BROKER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const requirements = await prisma.requirement.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(requirements);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "BROKER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();
  const req_ = await prisma.requirement.create({ data });
  return NextResponse.json(req_);
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "BROKER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, ...data } = await req.json();
  const updated = await prisma.requirement.update({ where: { id }, data });
  return NextResponse.json(updated);
}
