import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getParticipantSession } from "@/lib/participantAuth";
import { updateRegistration } from "@/modules/registrations/service";

const schema = z.object({
  jobTitle: z.string().optional(),
  objectives: z.string().optional(),
  networkingNotes: z.string().optional(),
  dietaryNotes: z.string().optional(),
  arrivalNotes: z.string().optional(),
  departureNotes: z.string().optional(),
  status: z.enum(["DRAFT", "SUBMITTED"]).optional(),
});

export async function PATCH(request: NextRequest) {
  const session = await getParticipantSession();
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Validação falhou" }, { status: 400 });
  const updated = await updateRegistration(session.registrationId, parsed.data);
  return NextResponse.json({ ok: true, registration: updated });
}
