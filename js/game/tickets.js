export function renderOffer({
  gameState,
  selectedOfferIndexesRef,
  updateSelectedOfferIndexes,
  updateDrawControls,
  renderHand,
  escapeHtml
}) {
  const container = document.getElementById("offerContainer");
  container.innerHTML = "";
  updateSelectedOfferIndexes(new Set());

  if (!gameState.tickets_offer.length) {
    container.className = "ticket-list empty-state";
    container.textContent = "No routes drawn yet.";
    document.getElementById("keepSelectedBtn").disabled = true;
    updateDrawControls();
    return;
  }

  container.className = "ticket-list";
  gameState.tickets_offer.forEach((ticket, index) => {
    const card = document.createElement("div");
    card.className = "ticket-card";
    card.innerHTML = `
      <label>
        <input type="checkbox" data-offer-index="${index}">
        <div>
          <div class="ticket-route">${escapeHtml(ticket.start)} → ${escapeHtml(ticket.end)}</div>
          <div class="ticket-meta"><span>${ticket.points} point${ticket.points === 1 ? "" : "s"}</span><span>Keep at least 1</span></div>
        </div>
      </label>
    `;
    container.appendChild(card);
  });

  container.querySelectorAll('input[type="checkbox"]').forEach(box => {
    box.addEventListener("change", () => {
      const next = new Set(selectedOfferIndexesRef());
      const idx = Number(box.dataset.offerIndex);
      if (box.checked) next.add(idx);
      else next.delete(idx);
      updateSelectedOfferIndexes(next);
      document.getElementById("keepSelectedBtn").disabled = next.size < 1;
    });
  });

  document.getElementById("keepSelectedBtn").disabled = true;
  updateDrawControls();
}

export function renderHand({
  gameState,
  buildClaimedGraph,
  getHighlightedStationNames,
  areCitiesConnected,
  clearStationGuides,
  updateStationStyles,
  updateStats,
  selectedGuideStationNameRef,
  escapeHtml
}) {
  const container = document.getElementById("handContainer");
  container.innerHTML = "";

  if (!gameState.tickets_hand.length) {
    container.className = "ticket-list empty-state";
    container.textContent = "No tickets in hand.";
    clearStationGuides();
    updateStationStyles();
    updateStats();
    return;
  }

  container.className = "ticket-list";
  const graph = buildClaimedGraph();
  const highlightedNames = getHighlightedStationNames();

  if (selectedGuideStationNameRef() && !highlightedNames.has(selectedGuideStationNameRef())) {
    clearStationGuides();
  }

  gameState.tickets_hand.forEach(ticket => {
    const complete = areCitiesConnected(ticket.start, ticket.end, graph);
    const card = document.createElement("div");
    card.className = "ticket-card " + (complete ? "ticket-complete" : "ticket-incomplete");
    card.innerHTML = `
      <div class="ticket-route">${escapeHtml(ticket.start)} → ${escapeHtml(ticket.end)}</div>
      <div class="ticket-meta"><span>${ticket.points} point${ticket.points === 1 ? "" : "s"}</span><span>${complete ? "Complete" : "Not complete yet"}</span></div>
      <div class="ticket-status">${complete ? "Scoring now." : "Highlighted map nodes show incomplete ticket endpoints. Click one of those larger nodes to draw a guide line."}</div>
    `;
    container.appendChild(card);
  });

  updateStationStyles();
  updateStats();
}

export function updateDrawControls({
  gameState,
  selectedOfferIndexes
}) {
  const drawBtn = document.getElementById("drawTicketsBtn");
  const keepBtn = document.getElementById("keepSelectedBtn");
  const hasOffer = gameState.tickets_offer.length > 0;

  drawBtn.disabled = hasOffer || gameState.tickets_deck_remaining.length === 0;
  keepBtn.disabled = !hasOffer || selectedOfferIndexes.size < 1;

  document.getElementById("drawNotice").textContent = hasOffer
    ? "Choose at least 1 route to keep before drawing again."
    : gameState.tickets_deck_remaining.length === 0
      ? "No routes left in the deck."
      : `Deck remaining: ${gameState.tickets_deck_remaining.length}`;
}

export function drawTickets({
  gameState,
  renderOffer,
  renderHand,
  queuePersist
}) {
  if (gameState.tickets_offer.length) return;

  const drawCount = Math.min(5, gameState.tickets_deck_remaining.length);
  if (!drawCount) return;

  gameState.tickets_offer = gameState.tickets_deck_remaining.slice(0, drawCount);
  gameState.tickets_deck_remaining = gameState.tickets_deck_remaining.slice(drawCount);

  renderOffer();
  renderHand();
  queuePersist("Tickets drawn");
}

export function keepSelectedTickets({
  gameState,
  selectedOfferIndexes,
  clearSelectedOfferIndexes,
  renderOffer,
  renderHand,
  queuePersist
}) {
  if (!gameState.tickets_offer.length || selectedOfferIndexes.size < 1) return;

  const kept = gameState.tickets_offer.filter((_, index) => selectedOfferIndexes.has(index));
  gameState.tickets_hand = gameState.tickets_hand.concat(kept);
  gameState.tickets_offer = [];
  clearSelectedOfferIndexes();

  renderOffer();
  renderHand();
  queuePersist("Tickets kept");
}
