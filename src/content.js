export const VERSION = 1;
export const SAVE_KEY = "idle-workshop-save";
export const TICK_INTERVAL_MS = 100;
export const AUTOSAVE_INTERVAL_MS = 10000;
export const OFFLINE_CAP_HOURS = 8;

export const GENERATORS = [
  {
    id: "assembler",
    name: "Assembler",
    description: "Automates simple parts.",
    baseCost: 10,
    costMultiplier: 1.15,
    baseProduction: 0.5,
  },
  {
    id: "forge",
    name: "Forge",
    description: "Forges durable components.",
    baseCost: 120,
    costMultiplier: 1.18,
    baseProduction: 4,
  },
  {
    id: "lab",
    name: "Research Lab",
    description: "Boosts advanced output.",
    baseCost: 1400,
    costMultiplier: 1.2,
    baseProduction: 18,
  },
];
