import { SAVE_KEY, VERSION } from "./content.js";

export function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) {
      return null;
    }
    const data = JSON.parse(raw);
    if (!data || data.version !== VERSION) {
      return null;
    }
    return data;
  } catch (error) {
    console.warn("Failed to load save", error);
    return null;
  }
}

export function saveGame(state) {
  const payload = {
    version: VERSION,
    lastSeen: Date.now(),
    state,
  };

  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn("Failed to save", error);
  }
}
