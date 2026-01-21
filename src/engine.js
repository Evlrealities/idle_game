import { GENERATORS } from "./content.js";

const generatorIndex = new Map(GENERATORS.map((gen) => [gen.id, gen]));

let state = createInitialState();

function createInitialState() {
  return {
    currency: 0,
    generators: GENERATORS.reduce((acc, gen) => {
      acc[gen.id] = 0;
      return acc;
    }, {}),
  };
}

export function hydrate(savedState) {
  state = createInitialState();
  if (!savedState) {
    return;
  }
  state.currency = Number(savedState.currency) || 0;
  for (const gen of GENERATORS) {
    state.generators[gen.id] = Number(savedState.generators?.[gen.id]) || 0;
  }
}

export function getState() {
  return JSON.parse(JSON.stringify(state));
}

export function getDerived() {
  const perSecond = GENERATORS.reduce((total, gen) => {
    return total + getGeneratorProduction(gen.id);
  }, 0);

  const costs = {};
  for (const gen of GENERATORS) {
    costs[gen.id] = getGeneratorCost(gen.id, 1);
  }

  return {
    perSecond,
    costs,
  };
}

export function tick(dtSeconds) {
  const derived = getDerived();
  state.currency += derived.perSecond * dtSeconds;
}

export function addGold(amount) {
  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0) {
    return;
  }
  state.currency += value;
}

export function buy(id, quantity) {
  const gen = generatorIndex.get(id);
  if (!gen) {
    return false;
  }
  const qty = Math.max(1, Math.floor(quantity));
  const cost = getGeneratorCost(id, qty);
  if (state.currency < cost) {
    return false;
  }
  state.currency -= cost;
  state.generators[id] += qty;
  return true;
}

export function getGeneratorProduction(id) {
  const gen = generatorIndex.get(id);
  if (!gen) {
    return 0;
  }
  const owned = state.generators[id] || 0;
  return gen.baseProduction * owned;
}

export function getGeneratorCost(id, quantity) {
  const gen = generatorIndex.get(id);
  if (!gen) {
    return 0;
  }
  const owned = state.generators[id] || 0;
  const qty = Math.max(1, Math.floor(quantity));
  const multiplier = gen.costMultiplier;
  if (multiplier === 1) {
    return gen.baseCost * qty;
  }
  const startCost = gen.baseCost * Math.pow(multiplier, owned);
  const totalCost = startCost * ((Math.pow(multiplier, qty) - 1) / (multiplier - 1));
  return totalCost;
}
