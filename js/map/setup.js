export function registerRouteGroups({
  routesData,
  routeGroups,
  segmentToRouteKey,
  parseRouteKey,
  parseRouteLength,
  parseRouteEndpoints,
  parseRouteClaimType
}) {
  routesData.features.forEach(feature => {
    const routeKey = parseRouteKey(feature.properties.name);
    const length = parseRouteLength(feature.properties.name);

    if (!routeGroups[routeKey]) {
      const endpoints = parseRouteEndpoints(routeKey);
      routeGroups[routeKey] = {
        key: routeKey,
        start: endpoints.start,
        end: endpoints.end,
        length,
        claim_type: parseRouteClaimType(feature),
        segmentIds: []
      };
    }

    routeGroups[routeKey].segmentIds.push(feature.properties.id);
    segmentToRouteKey[feature.properties.id] = routeKey;
  });
}

export function fitToData({ map, routeLayersById, L }) {
  const layers = Object.values(routeLayersById);

  if (!layers.length) return;

  const group = L.featureGroup(layers);
  map.fitBounds(group.getBounds(), { padding: [20, 20] });
}
