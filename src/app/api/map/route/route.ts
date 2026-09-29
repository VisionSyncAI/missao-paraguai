import { NextResponse } from "next/server";
import { DEFAULT_ROUTE } from "@/components/map/map-config";

export async function GET() {
  return NextResponse.json({
    ...DEFAULT_ROUTE,
    live: false,
    routing: "static_visualization",
    note: "Geometria ilustrativa do corredor. Não é navegação turn-by-turn nem posição ao vivo.",
  });
}
