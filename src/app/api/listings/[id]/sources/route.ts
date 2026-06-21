import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "BROKER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { rawSnippet } = await req.json();
  if (!rawSnippet?.trim()) return NextResponse.json({ error: "Content required" }, { status: 400 });

  const signal = await prisma.sourceSignal.create({
    data: { propertyId: id, sourceType: "MANUAL", rawSnippet: rawSnippet.trim(), capturedAt: new Date() },
  });

  return NextResponse.json(signal);
}
