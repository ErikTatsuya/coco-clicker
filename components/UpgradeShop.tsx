"use client";

import { BUILDINGS, UPGRADES, type UpgradeDefinition } from "@/lib/gameData";
import { formatNumber } from "@/lib/format";
import { getUpgradeRequirement, type GameSave } from "@/lib/gameLogic";

function requirementProgress(save: GameSave, upgrade: UpgradeDefinition) {
  const requirement = upgrade.requirement;
  if (requirement.type === "clicks") return { current: save.totalClicks, label: "cliques" };
  if (requirement.type === "earned") return { current: save.totalProduced, label: "cookies produzidos" };
  const building = BUILDINGS.find(({ id }) => id === requirement.buildingId);
  return { current: save.buildings[requirement.buildingId || ""] || 0, label: `${building?.name || "edifícios"}` };
}

export function UpgradeShop({ save, onPurchase }: { save: GameSave; onPurchase: (upgrade: UpgradeDefinition) => void }) {
  const unpurchased = UPGRADES.filter((upgrade) => !save.upgrades.includes(upgrade.id));
  const visible = unpurchased.slice(0, 8);
  const availableCount = unpurchased.filter((upgrade) => getUpgradeRequirement(save, upgrade)).length;

  return (
    <section className="rounded-2xl border border-[#e7d5b4] bg-[#fffaf0] p-4 shadow-[0_12px_32px_rgba(80,47,22,0.07)] sm:p-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#a07948]">Pequenos detalhes, grandes fornadas</p>
          <h2 className="mt-1 font-serif text-xl font-bold text-[#482d1a]">Melhorias</h2>
        </div>
        <span className="rounded-full bg-[#f2e5cc] px-3 py-1 text-xs font-bold text-[#76502e]">{availableCount} disponíveis</span>
      </div>
      {visible.length ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {visible.map((upgrade) => {
            const unlocked = getUpgradeRequirement(save, upgrade);
            const affordable = save.cookies >= upgrade.price;
            const progress = requirementProgress(save, upgrade);
            const fraction = Math.min(100, (progress.current / upgrade.requirement.value) * 100);
            return (
              <button
                key={upgrade.id}
                type="button"
                onClick={() => onPurchase(upgrade)}
                disabled={!unlocked || !affordable}
                className={`relative overflow-hidden rounded-xl border p-3 text-left transition ${
                  unlocked && affordable
                    ? "border-[#c79c5d] bg-[#fbf0d9] hover:-translate-y-0.5 hover:border-[#a97837] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
                    : "border-[#eadfcd] bg-[#f8f3e9] opacity-75"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xl ${unlocked ? "bg-[#f0dfbd]" : "bg-[#eee7da] grayscale"}`}>{upgrade.icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-[#55361e]">{upgrade.name}</span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-[#907557]">{upgrade.description}</span>
                    <span className="mt-2 flex items-center justify-between gap-2 text-[10px] font-bold">
                      <span className={affordable && unlocked ? "text-[#85521f]" : "text-[#9b886f]"}>🍪 {formatNumber(upgrade.price)}</span>
                      <span className="truncate text-[#9a866c]">{unlocked ? "Comprar melhoria" : `${formatNumber(progress.current)} / ${formatNumber(upgrade.requirement.value)} ${progress.label}`}</span>
                    </span>
                  </span>
                </div>
                {!unlocked && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#e7dbc7]"><span className="block h-full bg-[#c9a66c]" style={{ width: `${fraction}%` }} /></span>}
              </button>
            );
          })}
        </div>
      ) : (
        <p className="mt-4 rounded-xl bg-[#f7eedf] p-4 text-sm text-[#826548]">Todas as melhorias foram descobertas. Seu forno está no auge!</p>
      )}
      {unpurchased.length > visible.length && <p className="mt-3 text-center text-[11px] text-[#9b8466]">Mais {unpurchased.length - visible.length} melhorias aguardam desbloqueio.</p>}
    </section>
  );
}
