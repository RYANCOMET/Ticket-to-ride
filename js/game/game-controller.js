// js/game/game-controller.js

import {
  drawTickets as drawTicketsModule,
  keepSelectedTickets as keepSelectedTicketsModule
} from "./tickets.js";

import {
  getRouteClaimOffer as getRouteClaimOfferModule
} from "./route-claims.js";

import {
  isRouteComplete as isRouteCompleteModule
} from "./scoring.js";

export function createGameController(deps) {
  const {
    getGameState,
    setGameState,
    createNewGameState,

    getSelectedOfferIndexes,
    setSelectedOfferIndexes,

    getPreviewVisibleTrainCardId,
    setPreviewVisibleTrainCardId,

    routeGroups,
    routeLayersById,
    segmentToRouteKey,

    updateRouteStyle,
    bindRoutePopup,
    refreshAllTrainOverlays,

    renderOffer,
    renderHand,
    renderVisibleTrainCards,
    renderTrainHand,
    renderActiveChallengeCard,
    renderCompletedChallenges,
    updateStationStyles,
    updateStats,
    updateDrawControls,
    clearStationGuides,

    queuePersist,

    confirmFn = window.confirm,
    alertFn = window.alert
  } = deps;

  function renderAll() {
    clearStationGuides();

    setPreviewVisibleTrainCardId(null);

    renderOffer();
    renderHand();
    renderVisibleTrainCards();
    renderTrainHand();
    renderActiveChallengeCard();
    renderCompletedChallenges();
    updateStationStyles();
    updateStats();
  }

  function applyLoadedState(nextState) {
    setGameState(nextState);
    renderAll();
    updateDrawControls();
  }

  function onDrawTickets() {
    return drawTicketsModule({
      gameState: getGameState(),
      selectedOfferIndexes: getSelectedOfferIndexes(),
      setSelectedOfferIndexes,
      renderOffer,
      renderHand,
      updateDrawControls,
      queuePersist
    });
  }

  function onKeepSelectedTickets() {
    return keepSelectedTicketsModule({
      gameState: getGameState(),
      selectedOfferIndexes: getSelectedOfferIndexes(),
      setSelectedOfferIndexes,
      renderOffer,
      renderHand,
      updateDrawControls,
      queuePersist
    });
  }

  function onToggleRoute(entry) {
    const gameState = getGameState();
    const routeKey = segmentToRouteKey[entry.feature.properties.id];
    const group = routeGroups[routeKey];
    if (!group) return;

    if (isRouteCompleteModule({
      gameState,
      routeKey,
      routeGroups
    })) {
      const segmentSet = new Set(group.segmentIds);
      gameState.claimed_segments = gameState.claimed_segments.filter(
        item => !segmentSet.has(item)
      );

      if (gameState.route_claim_costs && gameState.route_claim_costs[routeKey]) {
        delete gameState.route_claim_costs[routeKey];
      }
    } else {
      const offer = getRouteClaimOfferModule({
        gameState,
        routeKey,
        routeGroups
      });

      if (!offer.canAfford) {
        alertFn(
          "You cannot claim this connection yet. " +
            (offer.reason || "Not enough train cars.")
        );
        return;
      }

      gameState.claimed_segments = Array.from(
        new Set([...gameState.claimed_segments, ...group.segmentIds])
      );

      gameState.route_claim_costs = gameState.route_claim_costs || {};
      gameState.route_claim_costs[routeKey] = offer.spendPlan;
    }

    group.segmentIds.forEach(segmentId => {
      const routeEntry = routeLayersById[segmentId];
      if (routeEntry) {
        updateRouteStyle(routeEntry);
        bindRoutePopup(routeEntry);
      }
    });

    Object.values(routeLayersById).forEach(bindRoutePopup);

    refreshAllTrainOverlays();
    renderTrainHand();
    updateStats();
    queuePersist("Route updated");
  }

  function onResetBoard() {
    const ok = confirmFn(
      "Reset the board, current offer, hand, and scores? The remaining deck will stay as it is."
    );
    if (!ok) return;

    const gameState = getGameState();
    gameState.claimed_segments = [];
    gameState.route_claim_costs = {};
    gameState.tickets_offer = [];
    gameState.tickets_hand = [];
    gameState.active_challenge_card = null;
    gameState.completed_challenge_cards = [];

    setPreviewVisibleTrainCardId(null);
    setSelectedOfferIndexes(new Set());

    renderAll();
    updateDrawControls();
    queuePersist("Board reset");
  }

  function onNewGame() {
    const ok = confirmFn(
      "Start a completely new game and reshuffle the ticket deck?"
    );
    if (!ok) return;

    setGameState(createNewGameState());
    setSelectedOfferIndexes(new Set());

    renderAll();
    updateDrawControls();
    queuePersist("New game");
  }

  return {
    renderAll,
    applyLoadedState,
    onDrawTickets,
    onKeepSelectedTickets,
    onToggleRoute,
    onResetBoard,
    onNewGame
  };
}
