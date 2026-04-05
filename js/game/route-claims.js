export function getTrainCardTypeLabel(typeKey, trainCardLookup) {
  if (typeKey === 'grey') return 'Grey';
  return (trainCardLookup[typeKey] || {}).label || 'Unknown';
}

export function createEmptyTrainCarCounts(trainCardTypes, includeGrey = false) {
  const keys = includeGrey
    ? ['grey', ...trainCardTypes.map(card => card.key)]
    : trainCardTypes.map(card => card.key);
  return Object.fromEntries(keys.map(key => [key, 0]));
}

export function computeSpentTrainCarCounts(gameState, trainCardTypes) {
  const counts = createEmptyTrainCarCounts(trainCardTypes);
  const routeCosts = gameState.route_claim_costs || {};

  Object.values(routeCosts).forEach(plan => {
    if (!plan || typeof plan !== 'object') return;
    Object.entries(plan).forEach(([typeKey, count]) => {
      if (!Object.prototype.hasOwnProperty.call(counts, typeKey)) return;
      counts[typeKey] += Math.max(0, Number(count) || 0);
    });
  });

  return counts;
}

export function computeAvailableTrainCarCounts({
  gameState,
  trainCardTypes,
  computeTrainCarStoreCounts
}) {
  const earned = computeTrainCarStoreCounts();
  const spent = computeSpentTrainCarCounts(gameState, trainCardTypes);
  const available = createEmptyTrainCarCounts(trainCardTypes);

  Object.keys(available).forEach(typeKey => {
    available[typeKey] = Math.max(
      0,
      (Number(earned[typeKey]) || 0) - (Number(spent[typeKey]) || 0)
    );
  });

  return available;
}

export function chooseGreyRouteSpendPlan(required, availableCounts, trainCardStandardKeys) {
  let best = null;

  trainCardStandardKeys.forEach(typeKey => {
    const colorCount = Number(availableCounts[typeKey]) || 0;
    const rainbowCount = Number(availableCounts.rainbow) || 0;
    if (colorCount + rainbowCount < required) return;

    const useColor = Math.min(required, colorCount);
    const useRainbow = Math.max(0, required - useColor);

    const candidate = {
      type_key: typeKey,
      spend_plan: {
        [typeKey]: useColor,
        rainbow: useRainbow
      },
      rainbow_used: useRainbow,
      color_used: useColor
    };

    if (
      !best ||
      candidate.rainbow_used < best.rainbow_used ||
      (candidate.rainbow_used === best.rainbow_used && candidate.color_used > best.color_used)
    ) {
      best = candidate;
    }
  });

  return best;
}

export function getRouteClaimOffer({
  routeKey,
  routeGroups,
  gameState,
  trainCardStandardKeys,
  getTrainCardTypeLabel,
  computeAvailableTrainCarCounts
}) {
  const group = routeGroups[routeKey];
  if (!group) return { canAfford: false, reason: 'Unknown connection.' };

  const required = Number(group.length) || 0;
  const routeType = group.claim_type || 'grey';
  const available = computeAvailableTrainCarCounts();

  if (routeType === 'grey') {
    const greyPlan = chooseGreyRouteSpendPlan(required, available, trainCardStandardKeys);
    if (!greyPlan) {
      return {
        canAfford: false,
        routeType,
        required,
        available,
        reason: 'Need ' + required + ' matching train cars of one colour pair, with rainbow cards allowed as wilds.'
      };
    }
    return {
      canAfford: true,
      routeType,
      required,
      available,
      chosenTypeKey: greyPlan.type_key,
      spendPlan: greyPlan.spend_plan
    };
  }

  const colorCount = Number(available[routeType]) || 0;
  const rainbowCount = Number(available.rainbow) || 0;

  if (colorCount + rainbowCount < required) {
    return {
      canAfford: false,
      routeType,
      required,
      available,
      reason: 'Need ' + required + ' ' + getTrainCardTypeLabel(routeType) + ' train cars. Rainbow cards can cover missing cars.'
    };
  }

  const useColor = Math.min(required, colorCount);

  return {
    canAfford: true,
    routeType,
    required,
    available,
    chosenTypeKey: routeType,
    spendPlan: {
      [routeType]: useColor,
      rainbow: Math.max(0, required - useColor)
    }
  };
}

export function describeSpendPlan(plan, getTrainCardTypeLabel) {
  if (!plan || typeof plan !== 'object') return 'None';

  const parts = Object.entries(plan)
    .filter(([, count]) => (Number(count) || 0) > 0)
    .map(([typeKey, count]) => String(count) + ' ' + getTrainCardTypeLabel(typeKey));

  return parts.length ? parts.join(' + ') : 'None';
}
