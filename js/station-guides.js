export function clearStationGuides({
  stationGuideLayerGroup,
  setSelectedGuideStationName,
  updateStationStyles
}) {
  stationGuideLayerGroup.clearLayers();
  setSelectedGuideStationName(null);
  updateStationStyles();
}

export function drawStationGuidesFrom({
  stationName,
  stationGuideLayerGroup,
  stationCoordsByName,
  getGuideDestinationsForStation,
  setSelectedGuideStationName,
  updateStationStyles,
  escapeHtml,
  L
}) {
  stationGuideLayerGroup.clearLayers();

  const fromCoords = stationCoordsByName[stationName];
  if (!fromCoords) {
    setSelectedGuideStationName(null);
    updateStationStyles();
    return;
  }

  const destinations = getGuideDestinationsForStation(stationName);
  if (!destinations.length) {
    setSelectedGuideStationName(null);
    updateStationStyles();
    return;
  }

  setSelectedGuideStationName(stationName);

  destinations.forEach(destName => {
    const toCoords = stationCoordsByName[destName];
    if (!toCoords) return;

    const line = L.polyline([fromCoords, toCoords], {
      color: '#f0d58a',
      weight: 4,
      opacity: 0.9,
      dashArray: '10 10',
      lineCap: 'round',
      className: 'station-guide-line'
    });

    line.bindPopup(
      `<div class="popup-title">${escapeHtml(stationName)} → ${escapeHtml(destName)}</div><div>Needed for an incomplete route ticket.</div>`
    );

    line.addTo(stationGuideLayerGroup);
  });

  updateStationStyles();
}

export function handleStationClick({
  stationName,
  getHighlightedStationNames,
  selectedGuideStationName,
  clearStationGuides,
  drawStationGuidesFrom
}) {
  const highlighted = getHighlightedStationNames();
  if (!highlighted.has(stationName)) return;

  if (selectedGuideStationName === stationName) {
    clearStationGuides();
    return;
  }

  drawStationGuidesFrom(stationName);
}

export function updateStationStyles({
  stationLayersByName,
  getHighlightedStationNames,
  selectedGuideStationName
}) {
  const highlighted = getHighlightedStationNames();

  Object.entries(stationLayersByName).forEach(([name, layer]) => {
    const isHighlighted = highlighted.has(name);
    const isSelected = selectedGuideStationName === name;

    layer.setStyle({
      radius: isSelected ? 10 : (isHighlighted ? 8 : 5),
      color: isSelected ? '#f7eed0' : (isHighlighted ? '#f0d58a' : '#7d3e12'),
      weight: isSelected ? 3 : 2,
      fillColor: isSelected ? '#8b5f1b' : (isHighlighted ? '#f0c36c' : '#d07a34'),
      fillOpacity: 0.96
    });
  });
}
