import { describe, expect, it } from "vitest";
import {
  BORDER,
  DEFAULT_ROUTE,
  DESTINATION,
  ORIGIN,
  publicMapStyleUrl,
  pointAlongLine,
  routeBounds,
  sliceLine,
} from "../src/components/map/map-config";
import { loadMapRoute, staticMapDataProvider } from "../src/components/map/MapDataProvider";
import { resolveRouteGeometry, staticRouteProvider } from "../src/components/map/RouteProvider";
import { interesseHref } from "../src/modules/interest/flow";

describe("mapa da imersão", () => {
  it("define origem, fronteira e destino reais", () => {
    expect(ORIGIN.type).toBe("origin");
    expect(ORIGIN.name).toBe("Brasil");
    expect(BORDER.type).toBe("border");
    expect(DESTINATION.name).toBe("Asunción");
    expect(DESTINATION.latitude).toBeCloseTo(-25.2637, 3);
    expect(DEFAULT_ROUTE.live).toBe(false);
    expect(DEFAULT_ROUTE.label).toBe("MAPA INTERATIVO");
    expect(DEFAULT_ROUTE.routing).toBe("static_visualization");
  });

  it("mantém geometria do corredor e interpola a rota", () => {
    expect(DEFAULT_ROUTE.geometry.coordinates.length).toBeGreaterThan(4);
    const start = pointAlongLine(DEFAULT_ROUTE.geometry, 0);
    const end = pointAlongLine(DEFAULT_ROUTE.geometry, 1);
    expect(start[0]).toBeCloseTo(ORIGIN.longitude, 3);
    expect(end[1]).toBeCloseTo(DESTINATION.latitude, 3);
    const half = sliceLine(DEFAULT_ROUTE.geometry, 0.5);
    expect(half.coordinates.length).toBeGreaterThan(1);
    const bounds = routeBounds(DEFAULT_ROUTE.geometry);
    expect(bounds[0][0]).toBeLessThan(bounds[1][0]);
  });

  it("rejeita style URL insegura e cai no fallback público", () => {
    expect(publicMapStyleUrl("http://evil.local/style.json")).toBe("https://tiles.openfreemap.org/styles/dark");
    expect(publicMapStyleUrl("not-a-url")).toBe("https://tiles.openfreemap.org/styles/dark");
    expect(publicMapStyleUrl("https://tiles.openfreemap.org/styles/dark")).toContain("https://");
  });

  it("provider estático não finge dado ao vivo", async () => {
    const live = await staticMapDataProvider.getLive();
    expect(live.live).toBe(false);
    const geom = await resolveRouteGeometry(staticRouteProvider);
    expect(geom.coordinates.at(-1)?.[0]).toBeCloseTo(DESTINATION.longitude, 3);
  });

  it("CTA preserva UTM e não cria outra jornada", () => {
    expect(interesseHref("?utm_source=mapa&foo=1")).toBe("/interesse?utm_source=mapa");
  });

  it("fallback sem API devolve rota estática", async () => {
    const data = await loadMapRoute("http://127.0.0.1:9");
    expect(data.destination.id).toBe("asuncion");
    expect(data.live).toBe(false);
  });
});
