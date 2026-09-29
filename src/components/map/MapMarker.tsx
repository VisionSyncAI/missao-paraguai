import type { RoutePoint } from "./types";

export function createMarkerElement(point: RoutePoint) {
  const el = document.createElement("button");
  el.type = "button";
  el.className = `ip-map-pin ip-map-pin--${point.type}`;
  el.setAttribute("aria-label", `${point.name}. ${point.title}`);
  el.innerHTML = `<span class="ip-map-pin-core"></span><span class="ip-map-pin-label">${point.name}</span>`;
  return el;
}
