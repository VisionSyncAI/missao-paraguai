import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { sha256, verifySecret } from "@/lib/crypto";
import { can } from "@/lib/rbac";

export { can } from "@/lib/rbac";

const COOKIE = "ip_staff";

type Session = {
  userId: string;
  role: string;
  consultantId: string | null;
  email: string;
  name: string;
};

function sign(payload: Session) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET ausente");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = sha256(`${body}.${secret}`);
  return `${body}.${sig}`;
}

function readToken(token: string | undefined): Session | null {
  if (!token) return null;
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  if (sha256(`${body}.${secret}`) !== sig) return null;
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as Session;
  } catch {
    return null;
  }
}

export async function createStaffSession(email: string, password: string) {
  const user = await prisma.staffUser.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || !verifySecret(password, user.passwordHash)) return null;
  const session: Session = {
    userId: user.id,
    role: user.role,
    consultantId: user.consultantId,
    email: user.email,
    name: user.name,
  };
  const jar = await cookies();
  jar.set(COOKIE, sign(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return session;
}

export async function destroyStaffSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getStaffSession() {
  const jar = await cookies();
  return readToken(jar.get(COOKIE)?.value);
}

export function assertPermission(session: Session | null, permission: string) {
  if (!session) {
    const error = new Error("UNAUTHENTICATED");
    throw error;
  }
  if (!can(session.role, permission)) {
    throw new Error("FORBIDDEN");
  }
  return session;
}
