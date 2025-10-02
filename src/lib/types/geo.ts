export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

export interface GeoViewport {
  topRight: GeoCoordinates;
  bottomLeft: GeoCoordinates;
}

export interface GeoTile {
  x: number;
  y: number;
  z: number;
}
