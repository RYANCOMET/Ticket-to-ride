export const state = {
  map: null,

  routeLayersById: new Map(),
  stationLayersByName: new Map(),
  stationCoordsByName: new Map(),

  gameState: null,
  selectedRouteId: null,
  activeGuideLines: []
};
