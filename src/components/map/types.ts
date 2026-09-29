export type RoutePointType = "origin" | "border" | "destination" | "strategic";

export type RoutePoint = {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  type: RoutePointType;
  title: string;
  body: string;
  items?: string[];
};

export type RouteLine = {
  type: "LineString";
  coordinates: [number, number][];
};

export type RouteData = {
  origin: RoutePoint;
  border: RoutePoint;
  destination: RoutePoint;
  geometry: RouteLine;
  live: false;
  routing: "static_visualization";
  label: "MAPA INTERATIVO";
};

export type MapLivePayload = {
  live: boolean;
  traffic?: never;
  weather?: never;
  events?: never;
};

export interface MapDataProvider {
  getRoute(): Promise<RouteData>;
  getLive(): Promise<MapLivePayload>;
}

export interface RouteProvider {
  getGeometry(): Promise<RouteLine>;
}
