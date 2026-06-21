import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { generateAIDraft } from "@/lib/ai-draft";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "BROKER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const draft = await generateAIDraft(id);

    const weekOf = new Date();
    weekOf.setHours(0, 0, 0, 0);
    const day = weekOf.getDay();
    weekOf.setDate(weekOf.getDate() - (day === 0 ? 6 : day - 1));

    const existing = await prisma.weeklyUpdate.findFirst({
      where: { propertyId: id, status: "DRAFT" },
      orderBy: { createdAt: "desc" },
    });

    if (existing) {
      await prisma.weeklyUpdate.update({
        where: { id: existing.id },
        data: { aiDraftBody: draft, finalBody: existing.finalBody ?? draft, weekOf },
      });
      return NextResponse.json({ updateId: existing.id, draft });
    } else {
      const created = await prisma.weeklyUpdate.create({
        data: { propertyId: id, weekOf, status: "DRAFT", aiDraftBody: draft, finalBody: draft },
      });
      return NextResponse.json({ updateId: created.id, draft });
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
