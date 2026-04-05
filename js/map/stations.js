export function buildStations({
  stationsData,
  stationLayerGroup,
  stationLayersByName,
  stationCoordsByName,
  handleStationClick,
  updateStationStyles,
  escapeHtml,
  L
}) {
  stationsData.features.forEach(feature => {
    const [lng, lat] = feature.geometry.coordinates;
    const name = String(feature.properties.name || "").trim();

    const layer = L.circleMarker([lat, lng], {
      radius: 5,
      color: "#7d3e12",
      weight: 2,
      fillColor: "#d07a34",
      fillOpacity: 0.96
    });

    stationLayersByName[name] = layer;
    stationCoordsByName[name] = [lat, lng];

    layer.on("click", () => handleStationClick(name));
    layer.bindPopup(
      `<div class="popup-title">${escapeHtml(name)}</div><div>Station</div>`
    );

    layer.addTo(stationLayerGroup);
  });

  updateStationStyles();
}
