export function createGameSync({
  sbClient,
  gameId,
  gameName,

  getGameState,
  setGameState,
  createNewGameState,
  normalizeState,

  serializeTrainStore,
  getPreviewTrainCard,

  renderLoadedState,
  updateStats,
  updateDrawControls,

  getLastKnownUpdatedAt,
  setLastKnownUpdatedAt,

  getPersistTimer,
  setPersistTimer
}) {
  function setSyncStatus(kind, message) {
    const pill = document.getElementById("syncStatus");
    const text = document.getElementById("syncMessage");
    if (!pill || !text) return;

    pill.className =
      "status-pill " +
      (kind === "online"
        ? "status-online"
        : kind === "offline"
          ? "status-offline"
          : "status-pending");

    pill.textContent =
      kind === "online"
        ? "Connected"
        : kind === "offline"
          ? "Offline mode"
          : "Syncing…";

    text.textContent = message;
  }

  async function persistGameState(reason = "State saved") {
    updateStats();

    if (!sbClient) {
      setSyncStatus("offline", "Supabase not available. Running locally only.");
      return;
    }

    const gameState = getGameState();

    const payload = {
      id: gameId,
      name: gameName,
      claimed_segments: gameState.claimed_segments,
      tickets_deck_remaining: gameState.tickets_deck_remaining,
      tickets_offer: gameState.tickets_offer,
      tickets_hand: gameState.tickets_hand,
      active_challenge: gameState.active_challenge_card ?? null,
      completed_challenges: gameState.completed_challenge_cards ?? [],
      train_store: serializeTrainStore(),
      active_preview_card: getPreviewTrainCard(),
      challenge_deck_remaining: gameState.challenge_deck_remaining ?? [],
      connection_points: gameState.connection_points,
      ticket_points: gameState.ticket_points,
      total_points: gameState.total_points,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await sbClient
      .from("games")
      .upsert(payload)
      .select("updated_at")
      .single();

    if (error) {
      console.error("Failed to save shared game:", error);
      setSyncStatus("offline", error.message || "Save failed.");
      return;
    }

    setLastKnownUpdatedAt(data?.updated_at || payload.updated_at);
    setSyncStatus("online", reason);
  }

  function queuePersist(reason) {
    const existingTimer = getPersistTimer();
    if (existingTimer) clearTimeout(existingTimer);

    const nextTimer = setTimeout(() => {
      persistGameState(reason);
    }, 200);

    setPersistTimer(nextTimer);
  }

  async function loadGameStateFromServer() {
    if (!sbClient) {
      setSyncStatus("offline", "Supabase not available. Running locally only.");
      renderLoadedState();
      updateDrawControls();
      return;
    }

    setSyncStatus("pending", "Loading shared game...");

    const { data, error } = await sbClient
      .from("games")
      .select("*")
      .eq("id", gameId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Failed to load shared game:", error);
      setSyncStatus("offline", error.message || "Load failed.");
      renderLoadedState();
      updateDrawControls();
      return;
    }

    if (!data) {
      setGameState(createNewGameState());
      renderLoadedState();
      updateDrawControls();
      await persistGameState("Created shared game");
      return;
    }

    setGameState(normalizeState(data));
    setLastKnownUpdatedAt(data.updated_at || null);
    renderLoadedState();
    updateDrawControls();
    setSyncStatus("online", "Shared game loaded.");
  }

  async function pollForRemoteUpdates() {
    if (!sbClient || !getLastKnownUpdatedAt()) return;

    const { data, error } = await sbClient
      .from("games")
      .select("*")
      .eq("id", gameId)
      .single();

    if (error || !data) return;

    if (data.updated_at && data.updated_at !== getLastKnownUpdatedAt()) {
      setLastKnownUpdatedAt(data.updated_at);
      setGameState(normalizeState(data));
      renderLoadedState();
      updateDrawControls();
      setSyncStatus("online", "Shared game updated.");
    }
  }

  return {
    setSyncStatus,
    persistGameState,
    queuePersist,
    loadGameStateFromServer,
    pollForRemoteUpdates
  };
}
