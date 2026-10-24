import { ACHIEVEMENTS, BUILDINGS, UPGRADES } from "./gameData";
import { createNewSave, SAVE_VERSION, type GameSave, MAX_GAME_VALUE } from "./gameLogic";

export const SAVE_KEY = "forno-do-cosmos-save";

export function validateSave(value: unknown): GameSave {
  if (!value || typeof value !== "object") throw new Error("O arquivo não contém um save válido.");
  const raw = value as Record<string, unknown>;
  const numericFields = ["cookies", "totalProduced", "totalClicks"] as const;
  for (const field of numericFields) {
    if (typeof raw[field] !== "number" || !Number.isFinite(raw[field]) || raw[field] < 0) {
      throw new Error(`O save contém um valor inválido em "${field}".`);
    }
  }
  if (!Number.isSafeInteger(raw.totalClicks)) throw new Error('O valor de "totalClicks" deve ser um número inteiro válido.');
  if (raw.version !== SAVE_VERSION) throw new Error("A versão deste save não é compatível.");
  if (!raw.buildings || typeof raw.buildings !== "object" || Array.isArray(raw.buildings)) {
    throw new Error("O save não contém os dados dos edifícios.");
  }
  const buildingValues = raw.buildings as Record<string, unknown>;
  const buildings: Record<string, number> = {};
  for (const { id } of BUILDINGS) {
    const amount = buildingValues[id];
    if (typeof amount !== "number" || !Number.isSafeInteger(amount) || amount < 0) {
      throw new Error(`A quantidade do edifício "${id}" é inválida.`);
    }
    buildings[id] = amount;
  }
  if (!Array.isArray(raw.upgrades) || raw.upgrades.some((id) => typeof id !== "string" || !UPGRADES.some((upgrade) => upgrade.id === id))) {
    throw new Error("A lista de melhorias do save é inválida.");
  }
  if (!Array.isArray(raw.achievements) || raw.achievements.some((id) => typeof id !== "string" || !ACHIEVEMENTS.some((achievement) => achievement.id === id))) {
    throw new Error("A lista de conquistas do save é inválida.");
  }
  if (new Set(raw.upgrades).size !== raw.upgrades.length || new Set(raw.achievements).size !== raw.achievements.length) {
    throw new Error("O save contém melhorias ou conquistas duplicadas.");
  }
  const offlineHours = raw.offlineHours;
  if (offlineHours !== 8 && offlineHours !== 24 && offlineHours !== 48) {
    throw new Error("O limite de produção offline do save é inválido.");
  }
  const now = Date.now();
  const lastSavedAt = typeof raw.lastSavedAt === "number" && Number.isFinite(raw.lastSavedAt) && raw.lastSavedAt > 0 && raw.lastSavedAt <= now
    ? raw.lastSavedAt
    : now;
  return {
    version: SAVE_VERSION,
    cookies: Math.min(raw.cookies as number, MAX_GAME_VALUE),
    totalProduced: Math.min(raw.totalProduced as number, MAX_GAME_VALUE),
    totalClicks: Math.min(raw.totalClicks as number, Number.MAX_SAFE_INTEGER),
    buildings,
    upgrades: [...raw.upgrades] as string[],
    achievements: [...raw.achievements] as string[],
    offlineHours,
    lastSavedAt,
  };
}

export function loadSave() {
  const raw = window.localStorage.getItem(SAVE_KEY);
  if (!raw) return { save: createNewSave(), hadSave: false };
  try {
    return { save: validateSave(JSON.parse(raw)), hadSave: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "O save não pôde ser lido.";
    throw new Error(`Save inválido: ${message}`);
  }
}

export function saveGame(save: GameSave) {
  const snapshot = { ...save, lastSavedAt: Date.now() };
  window.localStorage.setItem(SAVE_KEY, JSON.stringify(snapshot));
  return snapshot;
}

export function importSave(text: string) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("O texto não contém um JSON válido.");
  }
  return validateSave(parsed);
}
