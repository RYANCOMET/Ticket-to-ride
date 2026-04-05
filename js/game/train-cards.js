export function formatChallengeReward(value) {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

export function randomTrainCardKey(TRAIN_CARD_TYPES) {
  return TRAIN_CARD_TYPES[Math.floor(Math.random() * TRAIN_CARD_TYPES.length)].key;
}

export function nextTrainCardId(getTrainCardIdCounter, setTrainCardIdCounter) {
  const next = getTrainCardIdCounter() + 1;
  setTrainCardIdCounter(next);
  return "train-card-" + next;
}

export function getChallengePool(typeKey, TRAIN_CARD_STANDARD_KEYS, TRAIN_CARD_CHALLENGE_DECK) {
  if (typeKey === "rainbow") {
    return TRAIN_CARD_STANDARD_KEYS.flatMap(key =>
      (TRAIN_CARD_CHALLENGE_DECK[key] || []).map(card => ({ ...card, source_type: key }))
    );
  }
  return (TRAIN_CARD_CHALLENGE_DECK[typeKey] || []).map(card => ({ ...card, source_type: typeKey }));
}

export function createChallengeForType(typeKey, TRAIN_CARD_STANDARD_KEYS, TRAIN_CARD_CHALLENGE_DECK) {
  if (typeKey === "rainbow") {
    return {
      name: "Challenge name placeholder",
      description: "Do a chalange from the couples adventure book",
      reward: 1,
      locale: "Any"
    };
  }

  const pool = getChallengePool(typeKey, TRAIN_CARD_STANDARD_KEYS, TRAIN_CARD_CHALLENGE_DECK);
  if (!pool.length) {
    return {
      name: "Challenge name placeholder",
      description: "Challenge details go here.",
      reward: "—",
      locale: "Any"
    };
  }

  const picked = pool[Math.floor(Math.random() * pool.length)];
  return {
    name: picked.name || "Challenge name placeholder",
    description: picked.description || "",
    reward: picked.reward ?? "",
    locale: picked.locale || "Any"
  };
}

export function createTrainCard({
  typeKey,
  TRAIN_CARD_LOOKUP,
  TRAIN_CARD_STANDARD_KEYS,
  TRAIN_CARD_CHALLENGE_DECK,
  getTrainCardIdCounter,
  setTrainCardIdCounter
}) {
  const safeType = TRAIN_CARD_LOOKUP[typeKey] ? typeKey : "rainbow";
  return {
    id: nextTrainCardId(getTrainCardIdCounter, setTrainCardIdCounter),
    type_key: safeType,
    challenge: createChallengeForType(safeType, TRAIN_CARD_STANDARD_KEYS, TRAIN_CARD_CHALLENGE_DECK)
  };
}

export function sanitizeTrainCard({
  raw,
  fallbackType = "rainbow",
  TRAIN_CARD_LOOKUP,
  TRAIN_CARD_STANDARD_KEYS,
  TRAIN_CARD_CHALLENGE_DECK,
  getTrainCardIdCounter,
  setTrainCardIdCounter
}) {
  const typeKey = TRAIN_CARD_LOOKUP[String(raw?.type_key)] ? String(raw.type_key) : fallbackType;
  const fallbackChallenge = createChallengeForType(typeKey, TRAIN_CARD_STANDARD_KEYS, TRAIN_CARD_CHALLENGE_DECK);

  return {
    id: raw?.id
      ? String(raw.id)
      : nextTrainCardId(getTrainCardIdCounter, setTrainCardIdCounter),
    type_key: typeKey,
    challenge: {
      name: raw?.challenge?.name || fallbackChallenge.name || "Challenge name placeholder",
      description: raw?.challenge?.description || fallbackChallenge.description || "",
      reward: typeKey === "rainbow" ? 1 : (raw?.challenge?.reward ?? fallbackChallenge.reward ?? ""),
      locale: raw?.challenge?.locale || fallbackChallenge.locale || "Any"
    }
  };
}

export function countRainbowCards(cards) {
  return (cards || []).filter(card => {
    if (!card) return false;
    if (typeof card === "string") return card === "rainbow";
    return card.type_key === "rainbow";
  }).length;
}

export function dealFreshVisibleTrainCards({
  TRAIN_CARD_TYPES,
  TRAIN_CARD_LOOKUP,
  TRAIN_CARD_STANDARD_KEYS,
  TRAIN_CARD_CHALLENGE_DECK,
  getTrainCardIdCounter,
  setTrainCardIdCounter
}) {
  let cards = [];
  let tries = 0;

  do {
    cards = Array.from({ length: 5 }, () =>
      createTrainCard({
        typeKey: randomTrainCardKey(TRAIN_CARD_TYPES),
        TRAIN_CARD_LOOKUP,
        TRAIN_CARD_STANDARD_KEYS,
        TRAIN_CARD_CHALLENGE_DECK,
        getTrainCardIdCounter,
        setTrainCardIdCounter
      })
    );
    tries += 1;
  } while (countRainbowCards(cards) >= 3 && tries < 30);

  return cards;
}

export function normalizeVisibleTrainCards({
  raw,
  TRAIN_CARD_LOOKUP,
  TRAIN_CARD_TYPES,
  TRAIN_CARD_STANDARD_KEYS,
  TRAIN_CARD_CHALLENGE_DECK,
  getTrainCardIdCounter,
  setTrainCardIdCounter
}) {
  if (!Array.isArray(raw) || raw.length !== 5) {
    return dealFreshVisibleTrainCards({
      TRAIN_CARD_TYPES,
      TRAIN_CARD_LOOKUP,
      TRAIN_CARD_STANDARD_KEYS,
      TRAIN_CARD_CHALLENGE_DECK,
      getTrainCardIdCounter,
      setTrainCardIdCounter
    });
  }

  const cards = raw.map(item => {
    if (typeof item === "string") {
      return createTrainCard({
        typeKey: item,
        TRAIN_CARD_LOOKUP,
        TRAIN_CARD_STANDARD_KEYS,
        TRAIN_CARD_CHALLENGE_DECK,
        getTrainCardIdCounter,
        setTrainCardIdCounter
      });
    }

    if (!item || !TRAIN_CARD_LOOKUP[String(item.type_key)]) {
      return createTrainCard({
        typeKey: "rainbow",
        TRAIN_CARD_LOOKUP,
        TRAIN_CARD_STANDARD_KEYS,
        TRAIN_CARD_CHALLENGE_DECK,
        getTrainCardIdCounter,
        setTrainCardIdCounter
      });
    }

    return sanitizeTrainCard({
      raw: item,
      fallbackType: "rainbow",
      TRAIN_CARD_LOOKUP,
      TRAIN_CARD_STANDARD_KEYS,
      TRAIN_CARD_CHALLENGE_DECK,
      getTrainCardIdCounter,
      setTrainCardIdCounter
    });
  });

  return countRainbowCards(cards) >= 3
    ? dealFreshVisibleTrainCards({
        TRAIN_CARD_TYPES,
        TRAIN_CARD_LOOKUP,
        TRAIN_CARD_STANDARD_KEYS,
        TRAIN_CARD_CHALLENGE_DECK,
        getTrainCardIdCounter,
        setTrainCardIdCounter
      })
    : cards;
}

export function normalizeTrainHandCards({
  raw,
  legacyCounts,
  TRAIN_CARD_LOOKUP,
  TRAIN_CARD_STANDARD_KEYS,
  TRAIN_CARD_CHALLENGE_DECK,
  getTrainCardIdCounter,
  setTrainCardIdCounter
}) {
  const hand = [];

  if (Array.isArray(raw)) {
    raw.forEach(item => {
      if (!item) return;
      if (typeof item === "string") {
        hand.push(
          createTrainCard({
            typeKey: item,
            TRAIN_CARD_LOOKUP,
            TRAIN_CARD_STANDARD_KEYS,
            TRAIN_CARD_CHALLENGE_DECK,
            getTrainCardIdCounter,
            setTrainCardIdCounter
          })
        );
        return;
      }

      hand.push(
        sanitizeTrainCard({
          raw: item,
          fallbackType: "rainbow",
          TRAIN_CARD_LOOKUP,
          TRAIN_CARD_STANDARD_KEYS,
          TRAIN_CARD_CHALLENGE_DECK,
          getTrainCardIdCounter,
          setTrainCardIdCounter
        })
      );
    });
  }

  if (!hand.length && legacyCounts && typeof legacyCounts === "object") {
    Object.entries(legacyCounts).forEach(([typeKey, count]) => {
      const safeCount = Math.max(0, Number(count) || 0);
      for (let i = 0; i < safeCount; i += 1) {
        hand.push(
          createTrainCard({
            typeKey,
            TRAIN_CARD_LOOKUP,
            TRAIN_CARD_STANDARD_KEYS,
            TRAIN_CARD_CHALLENGE_DECK,
            getTrainCardIdCounter,
            setTrainCardIdCounter
          })
        );
      }
    });
  }

  return hand;
}

export function normalizeCompletedChallengeCards({
  raw,
  TRAIN_CARD_LOOKUP,
  TRAIN_CARD_STANDARD_KEYS,
  TRAIN_CARD_CHALLENGE_DECK,
  getTrainCardIdCounter,
  setTrainCardIdCounter
}) {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter(Boolean)
    .map(item =>
      sanitizeTrainCard({
        raw: item,
        fallbackType: "rainbow",
        TRAIN_CARD_LOOKUP,
        TRAIN_CARD_STANDARD_KEYS,
        TRAIN_CARD_CHALLENGE_DECK,
        getTrainCardIdCounter,
        setTrainCardIdCounter
      })
    );
}

export function reshuffleVisibleTrainCardsIfNeeded({
  gameState,
  normalizeVisibleTrainCards,
  dealFreshVisibleTrainCards
}) {
  gameState.visible_train_cards = normalizeVisibleTrainCards(gameState.visible_train_cards);

  if (countRainbowCards(gameState.visible_train_cards) >= 3) {
    gameState.visible_train_cards = dealFreshVisibleTrainCards();
  }
}

export function getPreviewTrainCard({
  previewVisibleTrainCardId,
  gameState,
  normalizeVisibleTrainCards
}) {
  if (previewVisibleTrainCardId === null || previewVisibleTrainCardId === undefined) return null;
  const cards = normalizeVisibleTrainCards(gameState.visible_train_cards);
  return cards.find(card => card.id === previewVisibleTrainCardId) || null;
}

export function computeTrainCarStoreCounts({
  gameState,
  createEmptyTrainCarCounts,
  normalizeCompletedChallengeCards
}) {
  const counts = createEmptyTrainCarCounts();
  const completed = normalizeCompletedChallengeCards(gameState.completed_challenge_cards);

  completed.forEach(card => {
    if (!card || !Object.prototype.hasOwnProperty.call(counts, card.type_key)) return;
    const reward = Number(card.challenge?.reward);
    counts[card.type_key] += Number.isFinite(reward) ? reward : 0;
  });

  return counts;
}

export function setTrainCardTrayOpen({
  isOpen,
  setIsTrainCardTrayOpen
}) {
  const open = !!isOpen;
  setIsTrainCardTrayOpen(open);

  const tray = document.getElementById("trainCardBar");
  const toggle = document.getElementById("trainCardTrayToggle");

  if (tray) {
    tray.classList.toggle("is-open", open);
    tray.classList.toggle("is-closed", !open);
  }

  if (toggle) {
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close challenge deck" : "Open challenge deck");
    toggle.setAttribute("title", open ? "Close challenge deck" : "Open challenge deck");
    toggle.textContent = "▲";
    toggle.classList.toggle("is-open", open);
  }
}

export function openTrainCardTray(setTrainCardTrayOpen) {
  setTrainCardTrayOpen(true);
}

export function closeTrainCardTray(setTrainCardTrayOpen) {
  setTrainCardTrayOpen(false);
}

export function toggleTrainCardTray(isTrainCardTrayOpen, setTrainCardTrayOpen) {
  setTrainCardTrayOpen(!isTrainCardTrayOpen);
}

export function renderVisibleTrainCards({
  gameState,
  TRAIN_CARD_LOOKUP,
  normalizeVisibleTrainCards,
  previewVisibleTrainCard,
  escapeHtml
}) {
  const row = document.getElementById("trainCardRow");
  if (!row) return;

  gameState.visible_train_cards = normalizeVisibleTrainCards(gameState.visible_train_cards);
  row.innerHTML = "";

  const total = gameState.visible_train_cards.length;
  const center = (total - 1) / 2;

  gameState.visible_train_cards.forEach((card, index) => {
    const meta = TRAIN_CARD_LOOKUP[card.type_key];
    const el = document.createElement("div");
    const offset = index - center;

    el.className = "train-card " + meta.key;
    el.title = "Preview " + meta.label;
    el.style.setProperty("--fan-rotate", offset * 4 + "deg");
    el.style.setProperty("--fan-lift", Math.abs(offset) * 3 + "px");
    el.innerHTML = "<span>" + escapeHtml(meta.label) + "</span>";
    el.addEventListener("click", event => {
      event.stopPropagation();
      previewVisibleTrainCard(card.id);
    });

    row.appendChild(el);
  });
}

export function renderActiveChallengeCard({
  gameState,
  TRAIN_CARD_LOOKUP,
  previewVisibleTrainCardId,
  sanitizeTrainCard,
  getPreviewTrainCard,
  formatChallengeReward,
  claimPreviewedChallenge,
  clearPreviewedChallenge,
  completeActiveChallenge,
  escapeHtml
}) {
  const overlay = document.getElementById("activeChallengeOverlay");
  const container = document.getElementById("activeChallengeContainer");
  if (!overlay || !container) return;

  gameState.active_challenge_card = gameState.active_challenge_card
    ? sanitizeTrainCard(gameState.active_challenge_card, "rainbow")
    : null;

  const previewCard = getPreviewTrainCard();
  const activeCard = gameState.active_challenge_card || null;
  const cardToShow = previewCard || activeCard;

  if (!cardToShow) {
    overlay.classList.remove("hidden");
    container.className = "ticket-list empty-state";
    container.textContent = "Choose a face-up train card to preview its challenge.";
    return;
  }

  const meta = TRAIN_CARD_LOOKUP[cardToShow.type_key] || TRAIN_CARD_LOOKUP["rainbow"];
  const challenge = cardToShow.challenge || {};
  const isPreview = !!previewCard;
  const canClaim = !activeCard;
  let actionsHtml = "";
  let messageHtml = "";

  if (isPreview) {
    actionsHtml =
      '<div class="train-card-actions">' +
      '<button id="claimChallengeBtn"' + (canClaim ? "" : " disabled") + '>Claim chalange</button>' +
      '<button id="backFromChallengeBtn" class="secondary">Back</button>' +
      "</div>";

    if (!canClaim) {
      messageHtml = '<div class="train-card-message">Finish the current active challenge before claiming another.</div>';
    }
  } else {
    actionsHtml =
      '<div class="train-card-actions">' +
      '<button id="completeChallengeBtn">Mark as complete</button>' +
      "</div>";
  }

  container.className = "";
  container.innerHTML =
    '<div class="active-train-card ' + meta.key + '">' +
    '<div class="active-train-card-header">' +
    "<strong>" + escapeHtml(meta.label) + "</strong>" +
    '<span class="train-hand-card-badge">' + (isPreview ? "Preview" : "Active") + "</span>" +
    "</div>" +
    "<h3>" + escapeHtml(challenge.name || "Challenge name placeholder") + "</h3>" +
    "<p>" + escapeHtml(challenge.description || "Challenge details go here.") + "</p>" +
    '<div class="active-train-card-meta">' +
    "<span>Reward: " + escapeHtml(formatChallengeReward(challenge.reward)) + "</span>" +
    "<span>Area: " + escapeHtml(challenge.locale || "Any") + "</span>" +
    "</div>" +
    actionsHtml +
    messageHtml +
    "</div>";

  overlay.classList.remove("hidden");

  if (isPreview) {
    const claimBtn = document.getElementById("claimChallengeBtn");
    const backBtn = document.getElementById("backFromChallengeBtn");
    if (claimBtn) claimBtn.addEventListener("click", claimPreviewedChallenge);
    if (backBtn) backBtn.addEventListener("click", clearPreviewedChallenge);
  } else {
    const completeBtn = document.getElementById("completeChallengeBtn");
    if (completeBtn) completeBtn.addEventListener("click", completeActiveChallenge);
  }
}

export function renderTrainHand({
  gameState,
  TRAIN_CARD_TYPES,
  TRAIN_CARD_LOOKUP,
  computeTrainCarStoreCounts,
  computeAvailableTrainCarCounts,
  escapeHtml
}) {
  const summary = document.getElementById("trainHandSummary");
  const container = document.getElementById("trainHandContainer");
  if (!summary || !container) return;

  const earned = computeTrainCarStoreCounts();
  const available = computeAvailableTrainCarCounts();
  const totalAvailable = Object.values(available).reduce((sum, value) => sum + value, 0);

  summary.textContent = totalAvailable + " train car" + (totalAvailable === 1 ? "" : "s") + " available";

  if (!totalAvailable) {
    container.className = "ticket-list empty-state";
    container.textContent = "Complete challenges to earn train cars.";
    return;
  }

  container.className = "train-hand-grid";
  container.innerHTML = TRAIN_CARD_TYPES.map(card => {
    const meta = TRAIN_CARD_LOOKUP[card.key];
    const availableCount = available[card.key] || 0;
    const earnedCount = earned[card.key] || 0;

    return (
      '<div class="train-hand-chip ' + escapeHtml(meta.key) + '">' +
      '<div class="train-hand-chip-main">' +
      '<span class="train-hand-swatch"></span>' +
      '<div class="train-hand-label">' + escapeHtml(meta.label) + "</div>" +
      "</div>" +
      '<div class="train-hand-counts">' +
      '<span class="train-hand-badge">' + escapeHtml(String(availableCount)) + "</span>" +
      '<span class="train-hand-badge is-earned">/' + escapeHtml(String(earnedCount)) + "</span>" +
      "</div>" +
      "</div>"
    );
  }).join("");
}

export function renderCompletedChallenges({
  gameState,
  TRAIN_CARD_LOOKUP,
  normalizeCompletedChallengeCards,
  formatChallengeReward,
  escapeHtml
}) {
  const summary = document.getElementById("completedChallengesSummary");
  const container = document.getElementById("completedChallengesContainer");
  if (!summary || !container) return;

  gameState.completed_challenge_cards = normalizeCompletedChallengeCards(gameState.completed_challenge_cards);
  const completed = gameState.completed_challenge_cards.slice();

  summary.textContent = completed.length + " completed";

  if (!completed.length) {
    container.className = "ticket-list empty-state";
    container.textContent = "No completed challenges yet.";
    return;
  }

  container.className = "train-hand-list";
  container.innerHTML = completed.slice().reverse().map(card => {
    const meta = TRAIN_CARD_LOOKUP[card.type_key] || TRAIN_CARD_LOOKUP["rainbow"];

    return (
      '<div class="completed-train-card ' + meta.key + '">' +
      '<div class="train-hand-card-top">' +
      "<strong>" + escapeHtml(meta.label) + "</strong>" +
      '<span class="train-hand-card-badge">+' + escapeHtml(formatChallengeReward(card.challenge?.reward)) + "</span>" +
      "</div>" +
      "<h4>" + escapeHtml(card.challenge?.name || "Challenge name placeholder") + "</h4>" +
      "<p>" + escapeHtml(card.challenge?.description || "Challenge details go here.") + "</p>" +
      "</div>"
    );
  }).join("");
}

export function previewVisibleTrainCard({
  cardId,
  gameState,
  normalizeVisibleTrainCards,
  setPreviewVisibleTrainCardId,
  openTrainCardTray,
  renderActiveChallengeCard
}) {
  const cards = normalizeVisibleTrainCards(gameState.visible_train_cards);
  const chosen = cards.find(card => card.id === cardId);
  if (!chosen) return;

  gameState.visible_train_cards = cards.slice();
  setPreviewVisibleTrainCardId(chosen.id);
  openTrainCardTray();
  renderActiveChallengeCard();
}

export function clearPreviewedChallenge({
  setPreviewVisibleTrainCardId,
  closeTrainCardTray,
  renderActiveChallengeCard
}) {
  setPreviewVisibleTrainCardId(null);
  closeTrainCardTray();
  renderActiveChallengeCard();
}

export function claimPreviewedChallenge({
  gameState,
  previewVisibleTrainCardId,
  normalizeVisibleTrainCards,
  sanitizeTrainCard,
  createTrainCard,
  reshuffleVisibleTrainCardsIfNeeded,
  setPreviewVisibleTrainCardId,
  closeTrainCardTray,
  renderVisibleTrainCards,
  renderActiveChallengeCard,
  queuePersist
}) {
  if (gameState.active_challenge_card) return;

  const cards = normalizeVisibleTrainCards(gameState.visible_train_cards);
  const index = cards.findIndex(card => card.id === previewVisibleTrainCardId);
  if (index === -1) return;

  const chosen = cards[index];
  gameState.active_challenge_card = sanitizeTrainCard(chosen, "rainbow");
  gameState.visible_train_cards = cards.slice();
  gameState.visible_train_cards[index] = createTrainCard("rainbow", true);

  reshuffleVisibleTrainCardsIfNeeded();
  setPreviewVisibleTrainCardId(null);
  closeTrainCardTray();
  renderVisibleTrainCards();
  renderActiveChallengeCard();
  queuePersist("Challenge claimed");
}

export function completeActiveChallenge({
  gameState,
  normalizeCompletedChallengeCards,
  sanitizeTrainCard,
  setPreviewVisibleTrainCardId,
  closeTrainCardTray,
  renderActiveChallengeCard,
  renderTrainHand,
  renderCompletedChallenges,
  queuePersist
}) {
  if (!gameState.active_challenge_card) return;

  gameState.completed_challenge_cards = normalizeCompletedChallengeCards(gameState.completed_challenge_cards);
  gameState.completed_challenge_cards.push(sanitizeTrainCard(gameState.active_challenge_card, "rainbow"));
  gameState.active_challenge_card = null;

  setPreviewVisibleTrainCardId(null);
  closeTrainCardTray();
  renderActiveChallengeCard();
  renderTrainHand();
  renderCompletedChallenges();
  queuePersist("Challenge completed");
}
