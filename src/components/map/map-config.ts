import type { RouteData, RouteLine, RoutePoint } from "./types";

/** Visualização do corredor São Paulo → Foz/CDE → Asunción. Não é navegação turn-by-turn. */
export const ROUTE_LINE: RouteLine = {
  type: "LineString",
  coordinates: [
    [-46.6333, -23.5505],
    [-47.0608, -22.9056],
    [-49.2733, -25.4284],
    [-51.9375, -23.4205],
    [-53.4553, -24.9558],
    [-54.5858, -25.5163],
    [-54.6111, -25.5097],
    [-55.4, -25.48],
    [-56.0167, -25.4667],
    [-56.45, -25.444],
    [-57.3333, -25.3],
    [-57.5759, -25.2637],
  ],
};

export const ORIGIN: RoutePoint = {
  id: "brasil",
  name: "Brasil",
  country: "Brasil",
  latitude: -23.5505,
  longitude: -46.6333,
  type: "origin",
  title: "Origem dos participantes",
  body: "Empresários brasileiros embarcam da sua cidade. A visualização usa o corredor Sudeste–Sul até a fronteira — não um único aeroporto oficial.",
  items: ["Empresários", "Empresas", "Indústria", "Agro", "Tecnologia", "Logística", "Comércio"],
};

export const BORDER: RoutePoint = {
  id: "fronteira",
  name: "Fronteira",
  country: "Brasil–Paraguai",
  latitude: -25.512,
  longitude: -54.598,
  type: "border",
  title: "Conexão Brasil–Paraguai",
  body: "Um corredor estratégico de negócios, comércio e integração regional.",
};

export const DESTINATION: RoutePoint = {
  id: "asuncion",
  name: "Asunción",
  country: "Paraguay",
  latitude: -25.2637,
  longitude: -57.5759,
  type: "destination",
  title: "Destino da Imersão",
  body: "Centro estratégico da experiência. A agenda concreta da edição é confirmada com o consultor — sem promessa de negócio garantido.",
  items: [
    "Agenda empresarial",
    "Visitas estratégicas",
    "Networking",
    "Relações institucionais",
    "Indústria",
    "Agro",
    "Tecnologia",
    "Oportunidades de negócios",
  ],
};

export const DEFAULT_ROUTE: RouteData = {
  origin: ORIGIN,
  border: BORDER,
  destination: DESTINATION,
  geometry: ROUTE_LINE,
  live: false,
  routing: "static_visualization",
  label: "MAPA INTERATIVO",
};

export const DEFAULT_STYLE_URL = "https://tiles.openfreemap.org/styles/dark";

export function publicMapStyleUrl(raw?: string | null) {
  const fallback = DEFAULT_STYLE_URL;
  if (!raw) return fallback;
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "https:") return fallback;
    return parsed.toString();
  } catch {
    return fallback;
  }
}

export function routeBounds(line: RouteLine): [[number, number], [number, number]] {
  let minLng = 180;
  let minLat = 90;
  let maxLng = -180;
  let maxLat = -90;
  for (const [lng, lat] of line.coordinates) {
    minLng = Math.min(minLng, lng);
    minLat = Math.min(minLat, lat);
    maxLng = Math.max(maxLng, lng);
    maxLat = Math.max(maxLat, lat);
  }
  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
}

export function pointAlongLine(line: RouteLine, t: number): [number, number] {
  const coords = line.coordinates;
  if (coords.length === 1) return coords[0];
  const clamped = Math.min(1, Math.max(0, t));
  const segs = coords.length - 1;
  const f = clamped * segs;
  const i = Math.min(segs - 1, Math.floor(f));
  const local = f - i;
  const a = coords[i];
  const b = coords[i + 1];
  return [a[0] + (b[0] - a[0]) * local, a[1] + (b[1] - a[1]) * local];
}

export function sliceLine(line: RouteLine, t: number): RouteLine {
  const end = pointAlongLine(line, t);
  const coords = line.coordinates;
  const segs = coords.length - 1;
  const f = Math.min(1, Math.max(0, t)) * segs;
  const i = Math.min(segs - 1, Math.floor(f));
  return { type: "LineString", coordinates: [...coords.slice(0, i + 1), end] };
}
