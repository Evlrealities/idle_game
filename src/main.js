import {
  AUTOSAVE_INTERVAL_MS,
  GENERATORS,
  OFFLINE_CAP_HOURS,
  TICK_INTERVAL_MS,
} from "./content.js";
import { formatNumber } from "./format.js";
import {
  buy,
  getDerived,
  getGeneratorCost,
  getGeneratorProduction,
  getState,
  hydrate,
  tick,
} from "./engine.js";
import { loadGame, saveGame } from "./storage.js";

const currencyEl = document.querySelector("#currency");
const perSecondEl = document.querySelector("#per-second");
const generatorListEl = document.querySelector("#generators");
const buyOneBtn = document.querySelector("#buy-1");
const buyTenBtn = document.querySelector("#buy-10");

const BUY_OPTIONS = [1, 10];
let selectedQuantity = 1;

function setSelectedQuantity(quantity) {
  selectedQuantity = quantity;
  buyOneBtn.classList.toggle("active", quantity === 1);
  buyTenBtn.classList.toggle("active", quantity === 10);
  render();
}

buyOneBtn.addEventListener("click", () => setSelectedQuantity(1));
buyTenBtn.addEventListener("click", () => setSelectedQuantity(10));

function createGeneratorRow(generator) {
  const wrapper = document.createElement("article");
  wrapper.className = "generator";
  wrapper.dataset.generatorId = generator.id;

  const info = document.createElement("div");
  const title = document.createElement("h3");
  title.textContent = generator.name;
  const desc = document.createElement("p");
  desc.textContent = generator.description;
  const production = document.createElement("p");
  production.className = "production";
  const owned = document.createElement("p");
  owned.className = "owned";

  info.append(title, desc, production, owned);

  const purchase = document.createElement("div");
  purchase.className = "purchase";
  const cost = document.createElement("span");
  cost.className = "cost";
  const button = document.createElement("button");
  button.className = "btn";
  button.textContent = "Buy";
  button.addEventListener("click", () => {
    if (buy(generator.id, selectedQuantity)) {
      render();
    }
  });

  purchase.append(cost, button);
  wrapper.append(info, purchase);

  return wrapper;
}

const generatorRows = new Map();
for (const generator of GENERATORS) {
  const row = createGeneratorRow(generator);
  generatorRows.set(generator.id, row);
  generatorListEl.appendChild(row);
}

function render() {
  const state = getState();
  const derived = getDerived();
  currencyEl.textContent = formatNumber(state.currency);
  perSecondEl.textContent = formatNumber(derived.perSecond);

  for (const generator of GENERATORS) {
    const row = generatorRows.get(generator.id);
    if (!row) continue;
    const production = row.querySelector(".production");
    const owned = row.querySelector(".owned");
    const cost = row.querySelector(".cost");
    const button = row.querySelector("button");
    const generatorProduction = getGeneratorProduction(generator.id);
    const price = getGeneratorCost(generator.id, selectedQuantity);
    production.textContent = `Produces ${formatNumber(generatorProduction)} / sec`;
    owned.textContent = `Owned: ${state.generators[generator.id]}`;
    cost.textContent = `Cost (${selectedQuantity}): ${formatNumber(price)}`;
    button.disabled = state.currency < price;
  }
}

function applyOfflineProgress(saved) {
  if (!saved?.lastSeen) {
    return;
  }
  const now = Date.now();
  const elapsedMs = Math.max(0, now - saved.lastSeen);
  const cappedMs = Math.min(elapsedMs, OFFLINE_CAP_HOURS * 60 * 60 * 1000);
  tick(cappedMs / 1000);
}

const saved = loadGame();
hydrate(saved?.state);
applyOfflineProgress(saved);
render();

let lastFrame = performance.now();
let accumulator = 0;

function frame(now) {
  const dt = now - lastFrame;
  lastFrame = now;
  accumulator += dt;

  while (accumulator >= TICK_INTERVAL_MS) {
    tick(TICK_INTERVAL_MS / 1000);
    accumulator -= TICK_INTERVAL_MS;
  }

  render();
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
setInterval(() => saveGame(getState()), AUTOSAVE_INTERVAL_MS);
window.addEventListener("beforeunload", () => saveGame(getState()));
