import { DEFAULT_ROUTE } from "./map-config";
import type { MapDataProvider, MapLivePayload, RouteData } from "./types";

export const staticMapDataProvider: MapDataProvider = {
  async getRoute(): Promise<RouteData> {
    return DEFAULT_ROUTE;
  },
  async getLive(): Promise<MapLivePayload> {
    return { live: false };
  },
};

export async function loadMapRoute(baseUrl = ""): Promise<RouteData> {
  try {
    const res = await fetch(`${baseUrl}/api/map/route`, { cache: "no-store" });
    if (!res.ok) return DEFAULT_ROUTE;
    const json = (await res.json()) as RouteData;
    if (!json?.geometry?.coordinates?.length) return DEFAULT_ROUTE;
    return { ...DEFAULT_ROUTE, ...json, live: false };
  } catch {
    return DEFAULT_ROUTE;
  }
}
