"use client";

import dynamic from "next/dynamic";

const MapRouteClient = dynamic(() => import("./MapRoute.client").then((mod) => mod.MapRouteClient), {
  ssr: false,
  loading: () => (
    <section className="ip-map" aria-label="Carregando mapa da rota">
      <p className="ip-map-sr">Rota da Imersão: Brasil → Fronteira → Paraguai → Asunción.</p>
    </section>
  ),
});

export function MapRoute() {
  return <MapRouteClient />;
}
