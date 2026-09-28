import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertPermission, getStaffSession } from "@/lib/auth";
import { listCatalog, publishOfficialPrice } from "@/modules/catalog/service";

export async function GET() {
  const session = await getStaffSession();
  try {
    assertPermission(session, "lead:read");
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: session ? 403 : 401 });
  }
  return NextResponse.json({ products: await listCatalog() });
}

const schema = z.object({
  productCode: z.string(),
  amountCents: z.number().int().positive(),
});

export async function POST(request: NextRequest) {
  const session = await getStaffSession();
  try {
    assertPermission(session, "catalog:write");
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: session ? 403 : 401 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Validação falhou" }, { status: 400 });
  const version = await publishOfficialPrice({
    ...parsed.data,
    actorId: session!.userId,
    actorRole: session!.role,
  });
  return NextResponse.json({ ok: true, version });
}
