export function connectionPointsForLength(length, routePointValues) {
  return routePointValues[length] ?? length;
}

export function isRouteComplete(routeKey, routeGroups, gameState) {
  const group = routeGroups[routeKey];
  return !!group && group.segmentIds.every(id => gameState.claimed_segments.includes(id));
}

export function getCompletedRouteKeys(routeGroups, gameState) {
  return Object.keys(routeGroups).filter(routeKey =>
    isRouteComplete(routeKey, routeGroups, gameState)
  );
}

export function buildClaimedGraph(routeGroups, gameState) {
  const graph = new Map();

  getCompletedRouteKeys(routeGroups, gameState).forEach(routeKey => {
    const group = routeGroups[routeKey];
    if (!graph.has(group.start)) graph.set(group.start, new Set());
    if (!graph.has(group.end)) graph.set(group.end, new Set());
    graph.get(group.start).add(group.end);
    graph.get(group.end).add(group.start);
  });

  return graph;
}

export function areCitiesConnected(start, end, graph) {
  if (start === end) return true;
  if (!graph.has(start) || !graph.has(end)) return false;

  const queue = [start];
  const visited = new Set([start]);

  while (queue.length) {
    const current = queue.shift();
    for (const next of graph.get(current)) {
      if (next === end) return true;
      if (!visited.has(next)) {
        visited.add(next);
        queue.push(next);
      }
    }
  }

  return false;
}

export function computeScores(routeGroups, gameState, routePointValues) {
  const completedKeys = getCompletedRouteKeys(routeGroups, gameState);
  const connectionPoints = completedKeys.reduce(
    (sum, key) => sum + connectionPointsForLength(routeGroups[key].length, routePointValues),
    0
  );
  const graph = buildClaimedGraph(routeGroups, gameState);
  const ticketPoints = gameState.tickets_hand.reduce(
    (sum, ticket) => sum + (areCitiesConnected(ticket.start, ticket.end, graph) ? ticket.points : 0),
    0
  );

  return {
    completedConnections: completedKeys.length,
    connectionPoints,
    ticketPoints,
    totalPoints: connectionPoints + ticketPoints,
    graph
  };
}

export function getIncompleteTickets(routeGroups, gameState) {
  const graph = buildClaimedGraph(routeGroups, gameState);
  return gameState.tickets_hand.filter(ticket =>
    !areCitiesConnected(ticket.start, ticket.end, graph)
  );
}

export function getHighlightedStationNames(routeGroups, gameState) {
  const names = new Set();
  getIncompleteTickets(routeGroups, gameState).forEach(ticket => {
    names.add(ticket.start);
    names.add(ticket.end);
  });
  return names;
}

export function getGuideDestinationsForStation(stationName, routeGroups, gameState) {
  const graph = buildClaimedGraph(routeGroups, gameState);
  const destinations = [];

  gameState.tickets_hand.forEach(ticket => {
    if (areCitiesConnected(ticket.start, ticket.end, graph)) return;
    if (ticket.start === stationName) destinations.push(ticket.end);
    else if (ticket.end === stationName) destinations.push(ticket.start);
  });

  return [...new Set(destinations)];
}
