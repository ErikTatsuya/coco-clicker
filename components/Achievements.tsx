"use client";

import { ACHIEVEMENTS } from "@/lib/gameData";
import { formatNumber } from "@/lib/format";
import type { GameSave } from "@/lib/gameLogic";

export function Achievements({ save, onClose }: { save: GameSave; onClose: () => void }) {
  const unlocked = new Set(save.achievements);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#321b12]/55 p-0 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="achievements-title" className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl border border-[#e7d5b4] bg-[#fffaf0] shadow-2xl sm:rounded-3xl">
        <header className="flex items-center justify-between border-b border-[#eadcc5] px-5 py-4 sm:px-7 sm:py-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#a07948]">Pequenas grandes vitórias</p>
            <h2 id="achievements-title" className="mt-1 font-serif text-2xl font-bold text-[#482d1a]">Conquistas</h2>
            <p className="mt-1 text-xs text-[#917859]">{save.achievements.length} de {ACHIEVEMENTS.length} desbloqueadas</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar conquistas" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f2e8d7] text-xl text-[#6c482c] hover:bg-[#ead9bc] focus-visible:outline-2 focus-visible:outline-amber-700">×</button>
        </header>
        <div className="grid gap-2 overflow-y-auto p-4 sm:grid-cols-2 sm:p-6">
          {ACHIEVEMENTS.map((achievement) => {
            const earned = unlocked.has(achievement.id);
            return (
              <article key={achievement.id} className={`flex items-center gap-3 rounded-xl border p-3 ${earned ? "border-[#e2c890] bg-[#fff3d8]" : "border-[#ece3d4] bg-[#f7f3eb] opacity-60"}`}>
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl ${earned ? "bg-[#f4dfad]" : "bg-[#e9e3d8] grayscale"}`}>{earned ? achievement.icon : "🔒"}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-[#583a21]">{achievement.name}</span>
                  <span className="mt-0.5 block text-xs leading-snug text-[#91795c]">{achievement.description}</span>
                </span>
                {earned && <span className="text-xs font-black text-[#b17c30]">✓</span>}
              </article>
            );
          })}
        </div>
        <footer className="border-t border-[#eadcc5] px-5 py-3 text-right text-xs text-[#907557]">
          Cookies produzidos: <strong className="text-[#684522]">{formatNumber(save.totalProduced)}</strong>
        </footer>
      </section>
    </div>
  );
}
