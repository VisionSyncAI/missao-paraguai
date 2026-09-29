import { DEFAULT_ROUTE } from "./map-config";
import type { RouteLine, RouteProvider } from "./types";

/** Sem secret no client. Routing real (OSRM/ORS) entra só via backend. */
export const staticRouteProvider: RouteProvider = {
  async getGeometry(): Promise<RouteLine> {
    return DEFAULT_ROUTE.geometry;
  },
};

export async function resolveRouteGeometry(provider: RouteProvider = staticRouteProvider) {
  try {
    return await provider.getGeometry();
  } catch {
    return DEFAULT_ROUTE.geometry;
  }
}
