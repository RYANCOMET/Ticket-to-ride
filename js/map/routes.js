export function buildRoutes({
  routesData,
  routeLayerGroup,
  routeLayersById,
  insetPolygon,
  topEdgePolygon,
  updateRouteStyle,
  bindRoutePopup,
  syncTrainOverlay,
  toggleRoute,
  L
}) {
  routesData.features.forEach(feature => {
    const outerCoords = feature.geometry.coordinates[0].map(([lng, lat]) => [lat, lng]);
    const innerCoords = insetPolygon(outerCoords, 0.88, 0.72);
    const shineCoords = topEdgePolygon(innerCoords, 0.22);

    const outer = L.polygon(outerCoords, { interactive: true, smoothFactor: 0.5 });
    const inner = L.polygon(innerCoords, { interactive: false, smoothFactor: 0.5 });
    const shine = shineCoords
      ? L.polygon(shineCoords, { interactive: false, smoothFactor: 0.5 })
      : null;

    const entry = { feature, outer, inner, shine, bounds: outer.getBounds(), trainMarker: null };
    routeLayersById[feature.properties.id] = entry;

    outer.on("click", () => toggleRoute(entry));
    updateRouteStyle(entry);
    bindRoutePopup(entry);
    syncTrainOverlay(entry);

    outer.addTo(routeLayerGroup);
    inner.addTo(routeLayerGroup);
    if (shine) shine.addTo(routeLayerGroup);
  });
}
