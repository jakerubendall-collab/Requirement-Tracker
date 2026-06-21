import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "BROKER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { finalBody, action } = body;

  if (action === "publish") {
    const updated = await prisma.weeklyUpdate.update({
      where: { id },
      data: { finalBody, status: "PUBLISHED", publishedAt: new Date() },
    });
    return NextResponse.json(updated);
  }

  const updated = await prisma.weeklyUpdate.update({
    where: { id },
    data: { finalBody },
  });
  return NextResponse.json(updated);
}
