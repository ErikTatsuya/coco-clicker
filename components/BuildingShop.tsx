"use client";

import { BUILDINGS, type BuildingDefinition } from "@/lib/gameData";
import { formatNumber } from "@/lib/format";
import { getBuildingCost, getMaxAffordable, getStats, type GameSave } from "@/lib/gameLogic";

export type PurchaseMode = 1 | 10 | -1;

export function BuildingShop({
  save,
  mode,
  onModeChange,
  onPurchase,
}: {
  save: GameSave;
  mode: PurchaseMode;
  onModeChange: (mode: PurchaseMode) => void;
  onPurchase: (building: BuildingDefinition, amount: number) => void;
}) {
  const stats = getStats(save);
  const modes: { value: PurchaseMode; label: string }[] = [
    { value: 1, label: "×1" },
    { value: 10, label: "×10" },
    { value: -1, label: "Máx." },
  ];

  return (
    <section className="overflow-hidden rounded-2xl border border-[#e7d5b4] bg-[#fffaf0] shadow-[0_12px_32px_rgba(80,47,22,0.07)]">
      <div className="flex items-center justify-between border-b border-[#eadcc5] px-4 py-4 sm:px-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#a07948]">Expanda seu império</p>
          <h2 className="mt-1 font-serif text-xl font-bold text-[#482d1a]">A loja</h2>
        </div>
        <div className="flex rounded-xl bg-[#f1e6d2] p-1" aria-label="Quantidade para comprar">
          {modes.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => onModeChange(item.value)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${mode === item.value ? "bg-[#81502c] text-[#fff8e9] shadow-sm" : "text-[#795638] hover:bg-white/70"}`}
              aria-pressed={mode === item.value}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <div className="max-h-[660px] overflow-y-auto">
        {BUILDINGS.map((building) => {
          const owned = save.buildings[building.id] || 0;
          const amount = mode === -1 ? getMaxAffordable(save, building) : mode;
          const cost = getBuildingCost(building, owned, amount);
          const affordable = amount > 0 && Number.isFinite(cost) && save.cookies >= cost;
          const production = building.cps * owned * 2 ** save.upgrades.filter((id) => id === `${building.id}-upgrade-10` || id === `${building.id}-upgrade-25`).length;
          const nextPrice = getBuildingCost(building, owned, 1);
          const progress = nextPrice === 0 ? 0 : Math.min(100, (save.cookies / nextPrice) * 100);
          return (
            <button
              key={building.id}
              type="button"
              onClick={() => onPurchase(building, mode)}
              disabled={!affordable}
              className={`group relative flex w-full items-center gap-3 overflow-hidden border-b border-[#eee1cd] px-4 py-3 text-left transition last:border-b-0 sm:px-5 ${
                affordable ? "cursor-pointer hover:bg-[#f5ead8] focus-visible:bg-[#f5ead8] focus-visible:outline-none" : "cursor-not-allowed opacity-65"
              }`}
              aria-label={`Comprar ${mode === -1 ? "o máximo possível" : mode} ${building.name}, custo ${formatNumber(cost)} cookies`}
            >
              <span className="absolute inset-x-0 bottom-0 h-[2px] bg-[#e8d7bc]">
                <span className="block h-full bg-[#c2944d] transition-[width] duration-300" style={{ width: `${progress}%` }} />
              </span>
              <span className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[23px] transition ${affordable ? "bg-[#f1e1c3] group-hover:scale-105" : "bg-[#f3ecdf] grayscale-[.35]"}`}>
                {building.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-bold text-[#53351f]">{building.name}</span>
                  <span className="shrink-0 rounded-full bg-[#ead8b9] px-2 py-0.5 text-xs font-black text-[#704525]">{owned}</span>
                </span>
                <span className="mt-1 block truncate text-[11px] text-[#9a8060]">{building.description}</span>
                <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] font-semibold text-[#846344]">
                  <span>🍪 {formatNumber(cost)}</span>
                  <span>⚡ +{formatNumber(production)}/s</span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-between bg-[#f7eedf] px-4 py-3 text-xs text-[#806142] sm:px-5">
        <span>{stats.totalBuildings} edifícios</span>
        <span>Produção: <strong className="text-[#67401f]">{formatNumber(stats.cps)} /s</strong></span>
      </div>
    </section>
  );
}
