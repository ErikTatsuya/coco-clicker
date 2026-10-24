export type BuildingDefinition = {
  id: string;
  name: string;
  description: string;
  icon: string;
  baseCost: number;
  growth: number;
  cps: number;
};

export const BUILDINGS: BuildingDefinition[] = [
  { id: "cursor", name: "Cursor", description: "Clica por você, sem reclamar.", icon: "👆", baseCost: 15, growth: 1.15, cps: 0.1 },
  { id: "grandma", name: "Vovó", description: "Uma avó simpática e eficiente.", icon: "👵", baseCost: 100, growth: 1.15, cps: 1 },
  { id: "farm", name: "Fazenda", description: "Planta sementes de chocolate.", icon: "🌱", baseCost: 1100, growth: 1.15, cps: 8 },
  { id: "mine", name: "Mina", description: "Extrai pepitas de cacau.", icon: "⛏️", baseCost: 12000, growth: 1.15, cps: 47 },
  { id: "factory", name: "Fábrica", description: "Produção em escala deliciosa.", icon: "🏭", baseCost: 130000, growth: 1.15, cps: 260 },
  { id: "bank", name: "Banco", description: "Investe cookies em mais cookies.", icon: "🏦", baseCost: 1.4e6, growth: 1.15, cps: 1400 },
  { id: "temple", name: "Templo", description: "Ora por uma colheita açucarada.", icon: "🛕", baseCost: 20e6, growth: 1.15, cps: 7800 },
  { id: "wizard", name: "Torre arcana", description: "Conjura fornadas do nada.", icon: "🪄", baseCost: 330e6, growth: 1.15, cps: 44000 },
  { id: "shipment", name: "Nave de entrega", description: "Traz ingredientes de outro mundo.", icon: "🚀", baseCost: 5.1e9, growth: 1.15, cps: 260000 },
  { id: "alchemy", name: "Laboratório alquímico", description: "Transforma chumbo em chocolate.", icon: "⚗️", baseCost: 75e9, growth: 1.15, cps: 1.6e6 },
  { id: "portal", name: "Portal", description: "Abre caminho para uma dimensão doce.", icon: "🌀", baseCost: 1.1e12, growth: 1.15, cps: 10e6 },
  { id: "time", name: "Máquina do tempo", description: "Importa cookies do passado.", icon: "⌛", baseCost: 16e12, growth: 1.15, cps: 65e6 },
  { id: "antimatter", name: "Condensador", description: "Condensa antimatéria em massa.", icon: "⚛️", baseCost: 230e12, growth: 1.15, cps: 430e6 },
  { id: "prism", name: "Prisma", description: "Dobra a luz e a converte em cookies.", icon: "💎", baseCost: 3.3e15, growth: 1.15, cps: 2.9e9 },
];

export type UpgradeDefinition = {
  id: string;
  name: string;
  description: string;
  icon: string;
  price: number;
  requirement: { type: "clicks" | "earned" | "building"; value: number; buildingId?: string };
  effect: { type: "click" | "global" | "building"; value: number; buildingId?: string };
};

export const UPGRADES: UpgradeDefinition[] = [
  { id: "steady-hand", name: "Mão treinada", description: "Cookies por clique ×2", icon: "✊", price: 25, requirement: { type: "clicks", value: 25 }, effect: { type: "click", value: 2 } },
  { id: "strong-wrist", name: "Pulso de padeiro", description: "Cookies por clique ×2", icon: "💪", price: 1e3, requirement: { type: "clicks", value: 100 }, effect: { type: "click", value: 2 } },
  { id: "oven-mitts", name: "Luvas térmicas", description: "Cookies por clique ×3", icon: "🧤", price: 5e4, requirement: { type: "clicks", value: 500 }, effect: { type: "click", value: 3 } },
  { id: "golden-touch", name: "Toque dourado", description: "Cookies por clique ×5", icon: "✨", price: 2e6, requirement: { type: "clicks", value: 2000 }, effect: { type: "click", value: 5 } },
  { id: "warm-welcome", name: "Boas-vindas quentinhas", description: "Produção total +10%", icon: "☀️", price: 500, requirement: { type: "earned", value: 1000 }, effect: { type: "global", value: 1.1 } },
  { id: "sugar-rush", name: "Pico de açúcar", description: "Produção total ×2", icon: "🍯", price: 1e5, requirement: { type: "earned", value: 1e5 }, effect: { type: "global", value: 2 } },
  { id: "chocolate-age", name: "Era do chocolate", description: "Produção total ×2", icon: "🍫", price: 1e8, requirement: { type: "earned", value: 1e8 }, effect: { type: "global", value: 2 } },
  { id: "sweet-singularity", name: "Singularidade doce", description: "Produção total ×2", icon: "🌌", price: 1e12, requirement: { type: "earned", value: 1e12 }, effect: { type: "global", value: 2 } },
  ...BUILDINGS.flatMap((building) => [
    {
      id: `${building.id}-upgrade-10`,
      name: `${building.name}: turno extra`,
      description: `Produção de ${building.name.toLowerCase()} ×2`,
      icon: building.icon,
      price: building.baseCost * 50,
      requirement: { type: "building" as const, value: 10, buildingId: building.id },
      effect: { type: "building" as const, value: 2, buildingId: building.id },
    },
    {
      id: `${building.id}-upgrade-25`,
      name: `${building.name}: excelência`,
      description: `Produção de ${building.name.toLowerCase()} ×2`,
      icon: building.icon,
      price: building.baseCost * 500,
      requirement: { type: "building" as const, value: 25, buildingId: building.id },
      effect: { type: "building" as const, value: 2, buildingId: building.id },
    },
  ]),
];

export type AchievementDefinition = {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: { type: "clicks" | "earned" | "cps" | "building"; value: number; buildingId?: string };
};

export const ACHIEVEMENTS: AchievementDefinition[] = [
  { id: "first-click", name: "Um bom começo", description: "Clique no cookie pela primeira vez.", icon: "👆", condition: { type: "clicks", value: 1 } },
  { id: "hundred-clicks", name: "Mão na massa", description: "Faça 100 cliques.", icon: "🖐️", condition: { type: "clicks", value: 100 } },
  { id: "thousand-clicks", name: "Dedos de ouro", description: "Faça 1.000 cliques.", icon: "✨", condition: { type: "clicks", value: 1000 } },
  ...[100, 1000, 1e6, 1e9, 1e12, 1e15].map((value) => ({
    id: `cookies-${value}`,
    name: `${formatAchievementNumber(value)} cookies`,
    description: `Produza ${formatAchievementNumber(value)} cookies ao todo.`,
    icon: "🍪",
    condition: { type: "earned" as const, value },
  })),
  ...BUILDINGS.flatMap((building) => [
    {
      id: `first-${building.id}`,
      name: `Primeiro ${building.name.toLowerCase()}`,
      description: `Compre seu primeiro ${building.name.toLowerCase()}.`,
      icon: building.icon,
      condition: { type: "building" as const, value: 1, buildingId: building.id },
    },
    {
      id: `ten-${building.id}`,
      name: `${building.name} em equipe`,
      description: `Tenha 10 ${building.name.toLowerCase()}s.`,
      icon: building.icon,
      condition: { type: "building" as const, value: 10, buildingId: building.id },
    },
  ]),
  ...[1, 100, 1e4, 1e6, 1e9].map((value) => ({
    id: `cps-${value}`,
    name: `${formatAchievementNumber(value)} por segundo`,
    description: `Alcance ${formatAchievementNumber(value)} cookies por segundo.`,
    icon: "⚡",
    condition: { type: "cps" as const, value },
  })),
];

function formatAchievementNumber(value: number) {
  return new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}
