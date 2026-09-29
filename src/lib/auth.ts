import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySecret } from "@/lib/crypto";
import { can, isStaffRole } from "@/lib/rbac";
import { sessionTimes, signSession, staffSecret, verifySession } from "@/lib/signedSession";

export { can } from "@/lib/rbac";

const COOKIE = "ip_staff";
const MAX_AGE = 60 * 60 * 12;

export type StaffSession = {
  userId: string;
  role: string;
  consultantId: string | null;
  email: string;
  name: string;
};

export async function createStaffSession(email: string, password: string) {
  const user = await prisma.staffUser.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || !verifySecret(password, user.passwordHash)) return null;
  const session: StaffSession = {
    userId: user.id,
    role: user.role,
    consultantId: user.consultantId,
    email: user.email,
    name: user.name,
  };
  const times = sessionTimes(MAX_AGE);
  const token = await signSession(
    {
      kind: "staff",
      sub: session.userId,
      role: session.role,
      consultantId: session.consultantId,
      email: session.email,
      name: session.name,
      ...times,
    },
    staffSecret(),
  );
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
  return session;
}

export async function destroyStaffSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function readStaffSession(token: string | undefined) {
  const payload = await verifySession(token, staffSecret(), "staff");
  if (!payload || !isStaffRole(payload.role)) return null;
  return {
    userId: payload.sub,
    role: payload.role,
    consultantId: payload.consultantId ?? null,
    email: payload.email || "",
    name: payload.name || "",
  } satisfies StaffSession;
}

export async function getStaffSession() {
  const jar = await cookies();
  const session = await readStaffSession(jar.get(COOKIE)?.value);
  if (!session) return null;
  const user = await prisma.staffUser.findUnique({ where: { id: session.userId } });
  if (!user || !isStaffRole(user.role)) return null;
  return {
    userId: user.id,
    role: user.role,
    consultantId: user.consultantId,
    email: user.email,
    name: user.name,
  } satisfies StaffSession;
}

export function assertPermission(session: StaffSession | null, permission: string) {
  if (!session) throw new Error("UNAUTHENTICATED");
  if (!can(session.role, permission)) throw new Error("FORBIDDEN");
  return session;
}
