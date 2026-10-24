import { ACHIEVEMENTS, BUILDINGS, UPGRADES, type BuildingDefinition, type UpgradeDefinition } from "./gameData";

export const SAVE_VERSION = 1;
export const MAX_GAME_VALUE = 1e300;

export type GameSave = {
  version: number;
  cookies: number;
  totalProduced: number;
  totalClicks: number;
  buildings: Record<string, number>;
  upgrades: string[];
  achievements: string[];
  offlineHours: number;
  lastSavedAt: number;
};

export type GameStats = {
  cps: number;
  clickPower: number;
  globalMultiplier: number;
  totalBuildings: number;
};

export function createNewSave(): GameSave {
  return {
    version: SAVE_VERSION,
    cookies: 0,
    totalProduced: 0,
    totalClicks: 0,
    buildings: Object.fromEntries(BUILDINGS.map(({ id }) => [id, 0])),
    upgrades: [],
    achievements: [],
    offlineHours: 24,
    lastSavedAt: Date.now(),
  };
}

function bounded(value: number) {
  return Number.isFinite(value) ? Math.min(MAX_GAME_VALUE, Math.max(0, value)) : MAX_GAME_VALUE;
}

function countBuildingUpgrade(save: GameSave, buildingId: string) {
  return save.upgrades.reduce((count, id) => {
    const upgrade = UPGRADES.find((candidate) => candidate.id === id);
    return count + (upgrade?.effect.type === "building" && upgrade.effect.buildingId === buildingId ? 1 : 0);
  }, 0);
}

export function getGlobalMultiplier(save: GameSave) {
  return bounded(save.upgrades.reduce((multiplier, id) => {
    const upgrade = UPGRADES.find((candidate) => candidate.id === id);
    return multiplier * (upgrade?.effect.type === "global" ? upgrade.effect.value : 1);
  }, 1));
}

export function getStats(save: GameSave): GameStats {
  const globalMultiplier = getGlobalMultiplier(save);
  const cps = bounded(BUILDINGS.reduce((total, building) => {
    const count = Math.max(0, save.buildings[building.id] || 0);
    const buildingMultiplier = 2 ** countBuildingUpgrade(save, building.id);
    return total + building.cps * count * buildingMultiplier;
  }, 0) * globalMultiplier);
  const clickMultiplier = save.upgrades.reduce((multiplier, id) => {
    const upgrade = UPGRADES.find((candidate) => candidate.id === id);
    return multiplier * (upgrade?.effect.type === "click" ? upgrade.effect.value : 1);
  }, 1);
  return {
    cps,
    clickPower: bounded(clickMultiplier * globalMultiplier),
    globalMultiplier,
    totalBuildings: BUILDINGS.reduce((total, building) => total + (save.buildings[building.id] || 0), 0),
  };
}

export function getBuildingPrice(building: BuildingDefinition, owned: number) {
  const price = building.baseCost * building.growth ** Math.max(0, owned);
  return Number.isFinite(price) && price <= MAX_GAME_VALUE ? price : Infinity;
}

export function getBuildingCost(building: BuildingDefinition, owned: number, amount: number) {
  if (amount <= 0) return 0;
  const firstPrice = getBuildingPrice(building, owned);
  const exponent = amount * Math.log(building.growth);
  if (exponent > 690) return Infinity;
  const cost = firstPrice * Math.expm1(exponent) / (building.growth - 1);
  return Number.isFinite(cost) && cost <= MAX_GAME_VALUE ? cost : Infinity;
}

export function getMaxAffordable(save: GameSave, building: BuildingDefinition) {
  const owned = save.buildings[building.id] || 0;
  const firstPrice = getBuildingPrice(building, owned);
  if (!Number.isFinite(firstPrice) || firstPrice > save.cookies) return 0;
  const estimated = Math.floor(Math.log1p(save.cookies * (building.growth - 1) / firstPrice) / Math.log(building.growth));
  let amount = Math.max(1, Math.min(Number.MAX_SAFE_INTEGER - owned, estimated));
  while (amount > 0 && getBuildingCost(building, owned, amount) > save.cookies) amount -= 1;
  while (amount < Number.MAX_SAFE_INTEGER - owned && getBuildingCost(building, owned, amount + 1) <= save.cookies) amount += 1;
  return amount;
}

export function getUpgradeRequirement(save: GameSave, upgrade: UpgradeDefinition) {
  const { type, value, buildingId } = upgrade.requirement;
  if (type === "clicks") return save.totalClicks >= value;
  if (type === "earned") return save.totalProduced >= value;
  return (save.buildings[buildingId || ""] || 0) >= value;
}

export function purchaseBuilding(save: GameSave, building: BuildingDefinition, amount: number): GameSave | null {
  if (!Number.isFinite(amount) || (amount <= 0 && amount !== -1)) return null;
  const owned = save.buildings[building.id] || 0;
  const actualAmount = amount === -1 ? getMaxAffordable(save, building) : Math.floor(amount);
  if (actualAmount <= 0 || actualAmount > Number.MAX_SAFE_INTEGER - owned) return null;
  const cost = getBuildingCost(building, owned, actualAmount);
  if (!Number.isFinite(cost) || cost > save.cookies) return null;
  return {
    ...save,
    cookies: Math.max(0, save.cookies - cost),
    buildings: { ...save.buildings, [building.id]: owned + actualAmount },
  };
}

export function purchaseUpgrade(save: GameSave, upgrade: UpgradeDefinition): GameSave | null {
  if (save.upgrades.includes(upgrade.id) || save.cookies < upgrade.price || !getUpgradeRequirement(save, upgrade)) return null;
  return { ...save, cookies: save.cookies - upgrade.price, upgrades: [...save.upgrades, upgrade.id] };
}

export function earnCookies(save: GameSave, amount: number): GameSave {
  const earned = bounded(Math.max(0, amount));
  return {
    ...save,
    cookies: bounded(save.cookies + earned),
    totalProduced: bounded(save.totalProduced + earned),
  };
}

export function getNewAchievements(save: GameSave) {
  const stats = getStats(save);
  return ACHIEVEMENTS.filter((achievement) => {
    if (save.achievements.includes(achievement.id)) return false;
    const { type, value, buildingId } = achievement.condition;
    if (type === "clicks") return save.totalClicks >= value;
    if (type === "earned") return save.totalProduced >= value;
    if (type === "cps") return stats.cps >= value;
    return (save.buildings[buildingId || ""] || 0) >= value;
  }).map(({ id }) => id);
}

export function unlockAchievements(save: GameSave): { save: GameSave; unlocked: string[] } {
  const unlocked = getNewAchievements(save);
  if (!unlocked.length) return { save, unlocked };
  return { save: { ...save, achievements: [...save.achievements, ...unlocked] }, unlocked };
}

export function applyOfflineProgress(save: GameSave, now = Date.now()) {
  const elapsedMs = Math.max(0, Math.min(now - save.lastSavedAt, save.offlineHours * 60 * 60 * 1000));
  const seconds = elapsedMs / 1000;
  const reward = bounded(getStats(save).cps * seconds);
  return { save: earnCookies(save, reward), seconds, reward };
}
