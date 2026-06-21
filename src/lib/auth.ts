import { cookies } from "next/headers";
import { prisma } from "./prisma";

export interface Session {
  userId: string;
  email: string;
  name: string;
  role: "BROKER" | "SELLER";
}

const SESSION_COOKIE = "listing_session";

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    const data = JSON.parse(Buffer.from(raw, "base64").toString("utf-8"));
    if (!data.userId || !data.role) return null;
    return data as Session;
  } catch {
    return null;
  }
}

export function buildSessionCookie(session: Session): string {
  const encoded = Buffer.from(JSON.stringify(session)).toString("base64");
  return `${SESSION_COOKIE}=${encoded}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`;
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export async function generateMagicLink(email: string): Promise<string> {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  await prisma.magicLink.create({ data: { email, token, expiresAt } });
  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
  return `${base}/api/auth/verify?token=${token}`;
}

export async function verifyMagicLink(token: string): Promise<Session | null> {
  const link = await prisma.magicLink.findUnique({ where: { token } });
  if (!link || link.usedAt || link.expiresAt < new Date()) return null;
  await prisma.magicLink.update({ where: { id: link.id }, data: { usedAt: new Date() } });
  const user = await prisma.user.findUnique({ where: { email: link.email } });
  if (!user) return null;
  return { userId: user.id, email: user.email, name: user.name, role: user.role as "BROKER" | "SELLER" };
}
