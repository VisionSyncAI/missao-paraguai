"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { trackFunnel } from "@/components/commercial/trackFunnel";
import { interesseHref, parseUtm } from "@/modules/interest/flow";
import { loadMapRoute } from "./MapDataProvider";
import { createMarkerElement } from "./MapMarker";
import { MapControls } from "./MapControls";
import { MapRoutePanel } from "./MapRoutePanel";
import {
  DEFAULT_ROUTE,
  DESTINATION,
  ORIGIN,
  pointAlongLine,
  publicMapStyleUrl,
  routeBounds,
  sliceLine,
} from "./map-config";
import type { RouteData, RoutePoint } from "./types";
import "./map-route.css";

const ROUTE_SUMMARY: RoutePoint = {
  id: "rota",
  name: "Rota da Imersão",
  country: "Brasil–Paraguay",
  latitude: DESTINATION.latitude,
  longitude: DESTINATION.longitude,
  type: "strategic",
  title: "Corredor Brasil → Paraguai",
  body: "Brasil → Fronteira → Paraguai → Asunción. Visualização do corredor da missão — não é rota turn-by-turn.",
};

function parentSearch() {
  try {
    return window.parent?.location?.search || window.location.search;
  } catch {
    return window.location.search;
  }
}

export function MapRouteClient() {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("maplibre-gl").Map | null>(null);
  const markersRef = useRef<import("maplibre-gl").Marker[]>([]);
  const destEl = useRef<HTMLButtonElement | null>(null);
  const raf = useRef(0);
  const [ready, setReady] = useState(false);
  const [route, setRoute] = useState<RouteData>(DEFAULT_ROUTE);
  const [selected, setSelected] = useState<RoutePoint | null>(null);
  const [reduced, setReduced] = useState(false);
  const viewed = useRef(false);
  const animated = useRef(false);

  const ctaHref = interesseHref(typeof window === "undefined" ? "" : parentSearch());

  const selectPoint = useCallback((point: RoutePoint, event: string) => {
    setSelected(point);
    trackFunnel(event, { source: "map", step: point.id, utm: parseUtm(parentSearch()) });
  }, []);

  const flyDestination = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      map.flyTo({ center: [DESTINATION.longitude, DESTINATION.latitude], zoom: 8.4, pitch: 42, duration: 1600 });
    } else {
      map.jumpTo({ center: [DESTINATION.longitude, DESTINATION.latitude], zoom: 8.2 });
    }
    selectPoint(DESTINATION, "MAP_DESTINATION_CLICKED");
  }, [selectPoint]);

  const fitRoute = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    map.fitBounds(routeBounds(route.geometry), { padding: 72, duration: reduced ? 0 : 900, pitch: 28 });
  }, [reduced, route.geometry]);

  const explore = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    map.easeTo({ pitch: 48, bearing: -28, duration: reduced ? 0 : 1100 });
  }, [reduced]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(reduce.matches);

    let cancelled = false;
    const start = async () => {
      const data = await loadMapRoute();
      if (cancelled) return;
      setRoute(data);
      const maplibre = await import("maplibre-gl");
      await import("maplibre-gl/dist/maplibre-gl.css");
      maplibre.setWorkerUrl("/maplibre-gl-worker.mjs");
      if (cancelled || mapRef.current) return;

      const map = new maplibre.Map({
        container: host,
        style: publicMapStyleUrl(process.env.NEXT_PUBLIC_MAP_STYLE_URL),
        center: [ORIGIN.longitude, ORIGIN.latitude],
        zoom: 4.2,
        pitch: 18,
        attributionControl: { compact: true },
        cooperativeGestures: true,
      });
      mapRef.current = map;

      map.on("load", () => {
        map.addSource("ip-route", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: reduce.matches ? data.geometry : sliceLine(data.geometry, 0.01),
          },
        });
        map.addLayer({
          id: "ip-route-glow",
          type: "line",
          source: "ip-route",
          paint: { "line-color": "#c1121f", "line-width": 8, "line-opacity": 0.18 },
        });
        map.addLayer({
          id: "ip-route-line",
          type: "line",
          source: "ip-route",
          paint: { "line-color": "#c1121f", "line-width": 2.2, "line-opacity": 0.92 },
        });
        map.addSource("ip-flow", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });
        map.addLayer({
          id: "ip-flow",
          type: "circle",
          source: "ip-flow",
          paint: { "circle-color": "#f5f5f2", "circle-radius": 2.4, "circle-opacity": 0.85 },
        });

        const points = [data.origin, data.border, data.destination];
        points.forEach((point) => {
          const el = createMarkerElement(point);
          if (point.type === "destination") destEl.current = el;
          el.addEventListener("click", () => {
            if (point.type === "destination") flyDestination();
            else {
              const ev = point.type === "origin" ? "MAP_ORIGIN_CLICKED" : "MAP_BORDER_CLICKED";
              selectPoint(point, ev);
            }
          });
          const marker = new maplibre.Marker({ element: el, anchor: "bottom" })
            .setLngLat([point.longitude, point.latitude])
            .addTo(map);
          markersRef.current.push(marker);
        });

        map.on("click", "ip-route-line", () => selectPoint(ROUTE_SUMMARY, "MAP_ROUTE_CLICKED"));
        map.on("mouseenter", "ip-route-line", () => {
          map.getCanvas().style.cursor = "pointer";
          map.setPaintProperty("ip-route-glow", "line-opacity", 0.32);
        });
        map.on("mouseleave", "ip-route-line", () => {
          map.getCanvas().style.cursor = "";
          map.setPaintProperty("ip-route-glow", "line-opacity", 0.18);
        });

        map.fitBounds(routeBounds(data.geometry), { padding: 80, duration: reduce.matches ? 0 : 1200 });
        setReady(true);
        if (!viewed.current) {
          viewed.current = true;
          trackFunnel("MAP_VIEWED", { source: "map", utm: parseUtm(parentSearch()) });
        }

        if (reduce.matches) {
          destEl.current?.classList.add("is-pulse");
          setSelected(DESTINATION);
          return;
        }

        const started = performance.now();
        const duration = 4200;
        const tick = (now: number) => {
          const t = Math.min(1, (now - started) / duration);
          const src = map.getSource("ip-route") as import("maplibre-gl").GeoJSONSource | undefined;
          src?.setData({
            type: "Feature",
            properties: {},
            geometry: sliceLine(data.geometry, t),
          });
          const flow = map.getSource("ip-flow") as import("maplibre-gl").GeoJSONSource | undefined;
          const features = [0, 0.18, 0.36, 0.54].map((offset) => {
            const p = pointAlongLine(data.geometry, Math.max(0, t - offset * (1 - t)));
            return { type: "Feature" as const, properties: {}, geometry: { type: "Point" as const, coordinates: p } };
          });
          flow?.setData({ type: "FeatureCollection", features });
          if (t < 1) {
            raf.current = requestAnimationFrame(tick);
            return;
          }
          destEl.current?.classList.add("is-pulse");
          setSelected(DESTINATION);
          if (!animated.current) {
            animated.current = true;
            trackFunnel("MAP_ROUTE_ANIMATED", { source: "map", utm: parseUtm(parentSearch()) });
          }
          const loop = (clock: number) => {
            const phase = ((clock / 8000) % 1);
            const loopFeatures = [0, 0.25, 0.5, 0.75].map((offset) => {
              const p = pointAlongLine(data.geometry, (phase + offset) % 1);
              return { type: "Feature" as const, properties: {}, geometry: { type: "Point" as const, coordinates: p } };
            });
            flow?.setData({ type: "FeatureCollection", features: loopFeatures });
            raf.current = requestAnimationFrame(loop);
          };
          raf.current = requestAnimationFrame(loop);
        };
        raf.current = requestAnimationFrame(tick);
      });
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          io.disconnect();
          void start();
        }
      },
      { rootMargin: "80px" },
    );
    io.observe(host);
    return () => {
      cancelled = true;
      io.disconnect();
      cancelAnimationFrame(raf.current);
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [flyDestination, selectPoint]);

  return (
    <section className="ip-map" aria-labelledby="ip-map-title">
      <p className="ip-map-sr" id="ip-map-alt">
        Rota da Imersão: Brasil → Fronteira → Paraguai → Asunción.
      </p>
      <div className="ip-map-stage">
        <div ref={hostRef} className="ip-map-canvas" role="application" aria-label="Mapa interativo Brasil Paraguai Asunción" />
        <div className="ip-map-status">
          <b>● {route.label}</b>
          <span>Brasil → Paraguai</span>
        </div>
        <div className="ip-map-copy">
          <h1 id="ip-map-title">
            Uma rota.
            <br />
            Dois países.
            <br />
            Novas oportunidades.
          </h1>
          <p>Conectamos empresários brasileiros ao ecossistema empresarial do Paraguai.</p>
        </div>
        {ready ? (
          <MapControls
            onZoomIn={() => mapRef.current?.zoomIn()}
            onZoomOut={() => mapRef.current?.zoomOut()}
            onFit={fitRoute}
            onExplore={explore}
            onReset={fitRoute}
          />
        ) : null}
      </div>
      <MapRoutePanel
        selected={selected}
        ctaHref={ctaHref}
        onExploreDestination={flyDestination}
        onCta={() => trackFunnel("MAP_CTA_CLICKED", { source: "map", cta: "GARANTIR_MINHA_VAGA", utm: parseUtm(parentSearch()) })}
      />
    </section>
  );
}
