"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Achievements } from "@/components/Achievements";
import { BuildingShop, type PurchaseMode } from "@/components/BuildingShop";
import { Cookie, type CookieFloat } from "@/components/Cookie";
import { OfflineReward } from "@/components/OfflineReward";
import { UpgradeShop } from "@/components/UpgradeShop";
import { ACHIEVEMENTS, UPGRADES, type BuildingDefinition, type UpgradeDefinition } from "@/lib/gameData";
import { formatNumber } from "@/lib/format";
import { applyOfflineProgress, createNewSave, earnCookies, getStats, purchaseBuilding, purchaseUpgrade, unlockAchievements, type GameSave } from "@/lib/gameLogic";
import { importSave, loadSave, saveGame } from "@/lib/saveManager";

type Modal = "settings" | "achievements" | "export" | "import" | null;

export default function Home() {
  const [game, setGame] = useState<GameSave | null>(null);
  const [ready, setReady] = useState(false);
  const [modal, setModal] = useState<Modal>(null);
  const [purchaseMode, setPurchaseMode] = useState<PurchaseMode>(1);
  const [floats, setFloats] = useState<CookieFloat[]>([]);
  const [offline, setOffline] = useState<{ seconds: number; reward: number } | null>(null);
  const [toast, setToast] = useState("");
  const [saveText, setSaveText] = useState("");
  const [message, setMessage] = useState("");
  const gameRef = useRef<GameSave | null>(null);
  const lastTickRef = useRef(0);
  const floatIdRef = useRef(0);

  const commit = useCallback((next: GameSave, feedback?: string) => {
    const result = unlockAchievements(next);
    gameRef.current = result.save;
    setGame(result.save);
    if (result.unlocked.length) {
      const unlockedName = ACHIEVEMENTS.find(({ id }) => id === result.unlocked[0])?.name;
      setToast(result.unlocked.length === 1 ? `Conquista: ${unlockedName || "desbloqueada"}` : `${result.unlocked.length} novas conquistas!`);
    } else if (feedback) {
      setToast(feedback);
    }
    if (result.unlocked.length || feedback) window.setTimeout(() => setToast(""), 2200);
  }, []);

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      try {
        const loaded = loadSave();
        const result = loaded.hadSave ? applyOfflineProgress(loaded.save) : { save: loaded.save, seconds: 0, reward: 0 };
        const withAchievements = unlockAchievements(result.save).save;
        gameRef.current = withAchievements;
        setGame(withAchievements);
        if (loaded.hadSave && result.reward > 0 && result.seconds >= 5) setOffline({ seconds: result.seconds, reward: result.reward });
        try {
          gameRef.current = saveGame(withAchievements);
        } catch (error) {
          setMessage(error instanceof Error ? `Jogo carregado, mas o save automático falhou: ${error.message}` : "Jogo carregado, mas não foi possível salvar automaticamente.");
        }
        setReady(true);
      } catch (error) {
        const fresh = createNewSave();
        gameRef.current = fresh;
        setGame(fresh);
        setMessage(error instanceof Error ? `${error.message} Um novo jogo foi iniciado.` : "Não foi possível carregar o save. Um novo jogo foi iniciado.");
        setReady(true);
      }
    }, 0);
    return () => window.clearTimeout(loadTimer);
  }, []);

  useEffect(() => {
    if (!ready) return;
    lastTickRef.current = Date.now();
    const timer = window.setInterval(() => {
      const now = Date.now();
      const elapsed = Math.max(0, (now - lastTickRef.current) / 1000);
      lastTickRef.current = now;
      const current = gameRef.current;
      if (!current || elapsed <= 0) return;
      const cps = getStats(current).cps;
      if (cps <= 0) return;
      commit(earnCookies(current, cps * elapsed));
    }, 200);
    const persist = () => {
      const current = gameRef.current;
      if (!current) return;
      try {
        gameRef.current = saveGame(current);
      } catch (error) {
        setMessage(error instanceof Error ? `Não foi possível salvar: ${error.message}` : "Não foi possível salvar o progresso.");
      }
    };
    const autosave = window.setInterval(persist, 5000);
    window.addEventListener("pagehide", persist);
    return () => {
      window.clearInterval(timer);
      window.clearInterval(autosave);
      window.removeEventListener("pagehide", persist);
    };
  }, [commit, ready]);

  const clickCookie = () => {
    if (!gameRef.current) return;
    const current = gameRef.current;
    const power = getStats(current).clickPower;
    const next = earnCookies({ ...current, totalClicks: Math.min(Number.MAX_SAFE_INTEGER, current.totalClicks + 1) }, power);
    const id = ++floatIdRef.current;
    setFloats((items) => [...items, { id, amount: power, left: 35 + Math.random() * 30, top: 27 + Math.random() * 25 }]);
    window.setTimeout(() => setFloats((items) => items.filter((item) => item.id !== id)), 900);
    commit(next);
  };

  const buyBuilding = (building: BuildingDefinition, amount: number) => {
    const current = gameRef.current;
    if (!current) return;
    const next = purchaseBuilding(current, building, amount);
    if (!next) return;
    const bought = amount === -1 ? next.buildings[building.id] - current.buildings[building.id] : amount;
    commit(next, `${building.name} ×${bought} comprado${bought === 1 ? "" : "s"}`);
  };

  const buyUpgrade = (upgrade: UpgradeDefinition) => {
    const current = gameRef.current;
    if (!current) return;
    const next = purchaseUpgrade(current, upgrade);
    if (next) commit(next, `${upgrade.name} desbloqueada`);
  };

  const changeOfflineLimit = (hours: number) => {
    const current = gameRef.current;
    if (current) commit({ ...current, offlineHours: hours });
  };

  const resetGame = () => {
    if (!window.confirm("Tem certeza? Todo o progresso salvo será apagado permanentemente.")) return;
    const fresh = createNewSave();
    gameRef.current = fresh;
    setGame(fresh);
    setOffline(null);
    setModal(null);
    try {
      gameRef.current = saveGame(fresh);
      setMessage("Progresso reiniciado.");
    } catch (error) {
      setMessage(error instanceof Error ? `O jogo foi reiniciado, mas não foi possível salvar: ${error.message}` : "O jogo foi reiniciado, mas não foi possível salvar.");
    }
  };

  const exportProgress = () => {
    if (!gameRef.current) return;
    setSaveText(JSON.stringify({ ...gameRef.current, lastSavedAt: Date.now() }, null, 2));
    setModal("export");
  };

  const importProgress = () => {
    try {
      const loaded = importSave(saveText);
      const current = { ...loaded, lastSavedAt: Date.now() };
      const unlocked = unlockAchievements(current).save;
      gameRef.current = unlocked;
      setGame(unlocked);
      setModal(null);
      try {
        gameRef.current = saveGame(unlocked);
        setMessage("Save importado com sucesso.");
      } catch (error) {
        setMessage(error instanceof Error ? `Save importado, mas não foi possível salvá-lo neste navegador: ${error.message}` : "Save importado, mas não foi possível salvá-lo neste navegador.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível importar esse save.");
    }
  };

  if (!ready || !game) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f0e3] text-[#704b2b]">
        <div className="text-center">
          <div className="animate-bounce text-5xl">🍪</div>
          <p className="mt-4 text-sm font-bold tracking-wide">Aquecendo o forno...</p>
        </div>
      </main>
    );
  }

  const stats = getStats(game);
  const availableUpgrades = UPGRADES.filter((upgrade) => !game.upgrades.includes(upgrade.id)).length;
  const achievementCount = game.achievements.length;
  const percentComplete = Math.round((achievementCount / ACHIEVEMENTS.length) * 100);

  return (
    <main className="min-h-screen bg-[#f7f0e3] pb-24 text-[#4f331f] selection:bg-[#e9c987] sm:pb-10">
      <div className="pointer-events-none fixed inset-0 -z-0 opacity-30" aria-hidden="true">
        <div className="absolute -left-24 top-40 h-72 w-72 rounded-full bg-[#e6cb9e] blur-[100px]" />
        <div className="absolute -right-20 top-[45%] h-80 w-80 rounded-full bg-[#d9c5a2] blur-[120px]" />
      </div>
      <header className="relative z-10 border-b border-[#e8dac2] bg-[#fffaf0]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#81502c] text-2xl shadow-md">🍪</span>
            <div className="min-w-0">
              <p className="truncate font-serif text-lg font-black tracking-tight text-[#55371f] sm:text-xl">Forno do Cosmos</p>
              <p className="hidden text-[10px] font-bold uppercase tracking-[.2em] text-[#a1835b] sm:block">Um império recém-saído do forno</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden rounded-xl border border-[#eadcc5] bg-white/70 px-3 py-2 text-right sm:block">
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#9f8057]">Produção</p>
              <p className="text-sm font-black text-[#6b4828]">{formatNumber(stats.cps)} <span className="text-[10px] font-semibold">/s</span></p>
            </div>
            <button type="button" onClick={() => setModal("achievements")} className="flex items-center gap-2 rounded-xl border border-[#eadcc5] bg-white/70 px-3 py-2 text-xs font-bold text-[#704c2c] transition hover:bg-[#f5ead8] focus-visible:outline-2 focus-visible:outline-amber-700" aria-label={`Abrir conquistas: ${achievementCount} desbloqueadas`}>
              <span className="text-base">🏅</span><span className="hidden sm:inline">{achievementCount}</span>
            </button>
            <button type="button" onClick={() => setModal("settings")} className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#eadcc5] bg-white/70 text-lg text-[#704c2c] transition hover:bg-[#f5ead8] focus-visible:outline-2 focus-visible:outline-amber-700" aria-label="Configurações">⚙</button>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-[1440px] px-4 pb-10 pt-5 sm:px-6 sm:pt-8 lg:px-8">
        {message && (
          <div role="status" className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-[#dfc18e] bg-[#fff3d8] px-4 py-3 text-sm text-[#704a25]">
            <span>{message}</span>
            <button type="button" aria-label="Dispensar aviso" onClick={() => setMessage("")} className="font-bold">×</button>
          </div>
        )}
        {toast && <div role="status" className="fixed right-4 top-20 z-40 rounded-xl border border-[#d9bd88] bg-[#fff5dc] px-4 py-3 text-sm font-bold text-[#71471d] shadow-xl">{toast}</div>}

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.12fr)_minmax(370px,.88fr)] xl:gap-7">
          <section className="overflow-hidden rounded-3xl border border-[#e7d5b4] bg-[#fffaf0] shadow-[0_16px_48px_rgba(80,47,22,0.08)]">
            <div className="relative overflow-hidden bg-gradient-to-br from-[#f7e9cd] via-[#f4e5c8] to-[#ead6b3] px-5 pb-5 pt-6 text-center sm:px-8 sm:pb-7 sm:pt-8">
              <div className="pointer-events-none absolute -left-8 -top-12 h-48 w-48 rounded-full border border-white/30" />
              <div className="pointer-events-none absolute -right-8 -top-20 h-64 w-64 rounded-full border border-white/30" />
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[.26em] text-[#a17b4d]">Uma fornada de cada vez</p>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <span className="text-2xl">🍪</span>
                  <h1 className="font-serif text-4xl font-black tracking-tight text-[#593a20] sm:text-5xl">{formatNumber(game.cookies)}</h1>
                </div>
                <p className="mt-1 text-xs font-semibold text-[#90724e]">cookies no pote</p>
                <div className="mt-1 flex items-center justify-center gap-1 text-[11px] font-semibold text-[#947b5b] sm:hidden">
                  <span>⚡ {formatNumber(stats.cps)} por segundo</span><span>·</span><span>👆 {formatNumber(stats.clickPower)} por clique</span>
                </div>
                <div className="mt-0 flex justify-center">
                  <Cookie onClick={clickCookie} floats={floats} />
                </div>
                <p className="-mt-1 text-xs font-semibold text-[#8c704e]">Clique no cookie para produzir mais</p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                  <div className="rounded-xl border border-white/70 bg-white/55 px-4 py-2 text-left backdrop-blur-sm">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-[#9f8057]">Por clique</p>
                    <p className="text-sm font-black text-[#674323]">+{formatNumber(stats.clickPower)}</p>
                  </div>
                  <div className="rounded-xl border border-white/70 bg-white/55 px-4 py-2 text-left backdrop-blur-sm">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-[#9f8057]">Por segundo</p>
                    <p className="text-sm font-black text-[#674323]">+{formatNumber(stats.cps)}</p>
                  </div>
                  <div className="hidden rounded-xl border border-white/70 bg-white/55 px-4 py-2 text-left backdrop-blur-sm sm:block">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-[#9f8057]">Já produzidos</p>
                    <p className="text-sm font-black text-[#674323]">{formatNumber(game.totalProduced)}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 divide-x divide-[#eadcc5] bg-[#fffaf0]">
              <div className="px-3 py-3 text-center">
                <p className="text-[9px] font-bold uppercase tracking-widest text-[#9f8057]">Cliques</p>
                <p className="mt-1 text-sm font-black text-[#664321]">{formatNumber(game.totalClicks, 0)}</p>
              </div>
              <div className="px-3 py-3 text-center">
                <p className="text-[9px] font-bold uppercase tracking-widest text-[#9f8057]">Edifícios</p>
                <p className="mt-1 text-sm font-black text-[#664321]">{formatNumber(stats.totalBuildings, 0)}</p>
              </div>
              <div className="px-3 py-3 text-center">
                <p className="text-[9px] font-bold uppercase tracking-widest text-[#9f8057]">Multiplicador</p>
                <p className="mt-1 text-sm font-black text-[#664321]">×{formatNumber(stats.globalMultiplier, 2)}</p>
              </div>
            </div>
          </section>

          <div id="shop" className="scroll-mt-5">
            <BuildingShop save={game} mode={purchaseMode} onModeChange={setPurchaseMode} onPurchase={buyBuilding} />
          </div>
        </div>

        <div id="upgrades" className="mt-5 scroll-mt-5 lg:mt-7">
          <UpgradeShop save={game} onPurchase={buyUpgrade} />
        </div>

        <section className="mt-5 flex flex-col items-start justify-between gap-4 rounded-2xl border border-[#e7d5b4] bg-[#fffaf0] px-4 py-4 shadow-[0_8px_24px_rgba(80,47,22,0.05)] sm:flex-row sm:items-center sm:px-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f3e4c5] text-2xl">🏆</span>
            <div>
              <p className="font-serif text-base font-bold text-[#55371f]">Coleção de conquistas</p>
              <p className="mt-0.5 text-xs text-[#92785a]">{achievementCount} desbloqueadas · {percentComplete}% da coleção</p>
              <div className="mt-2 h-1.5 w-48 overflow-hidden rounded-full bg-[#eee2ce]">
                <div className="h-full rounded-full bg-[#c99b50] transition-[width] duration-500" style={{ width: `${Math.min(100, percentComplete)}%` }} />
              </div>
            </div>
          </div>
          <button type="button" onClick={() => setModal("achievements")} className="rounded-xl border border-[#d9c39e] bg-[#fbf3e3] px-4 py-2 text-xs font-bold text-[#76502e] transition hover:bg-[#f3e5ca] focus-visible:outline-2 focus-visible:outline-amber-700">
            Ver conquistas <span aria-hidden="true">→</span>
          </button>
        </section>
        <footer className="mt-7 flex flex-wrap items-center justify-between gap-2 text-[10px] font-medium text-[#a08b6d]">
          <span>Forno do Cosmos · Feito para quem ama uma boa fornada.</span>
          <span>Salvamento automático ativo · progresso neste navegador</span>
        </footer>
      </div>

      <nav aria-label="Navegação rápida" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-[#e7d5b4] bg-[#fffaf0]/95 px-2 py-2 shadow-[0_-8px_24px_rgba(80,47,22,0.08)] backdrop-blur-md sm:hidden">
        <a href="#shop" className="flex flex-col items-center gap-0.5 py-1 text-[10px] font-bold text-[#795737]"><span className="text-lg">🏪</span>Loja</a>
        <a href="#upgrades" className="flex flex-col items-center gap-0.5 py-1 text-[10px] font-bold text-[#795737]"><span className="text-lg">✨</span>Melhorias <span className="sr-only">{availableUpgrades} restantes</span></a>
        <button type="button" onClick={() => setModal("achievements")} className="flex flex-col items-center gap-0.5 py-1 text-[10px] font-bold text-[#795737]"><span className="text-lg">🏆</span>Conquistas</button>
      </nav>

      {modal === "achievements" && <Achievements save={game} onClose={() => setModal(null)} />}
      {offline && <OfflineReward seconds={offline.seconds} reward={offline.reward} onClose={() => setOffline(null)} />}
      {modal === "settings" && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#321b12]/55 p-0 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="settings-title" className="w-full max-w-md rounded-t-3xl border border-[#e7d5b4] bg-[#fffaf0] p-5 shadow-2xl sm:rounded-3xl sm:p-6">
            <div className="flex items-start justify-between">
              <div><p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#a07948]">Seu jogo, suas regras</p><h2 id="settings-title" className="mt-1 font-serif text-2xl font-bold text-[#482d1a]">Configurações</h2></div>
              <button type="button" onClick={() => setModal(null)} aria-label="Fechar configurações" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f2e8d7] text-xl hover:bg-[#ead9bc]">×</button>
            </div>
            <label className="mt-6 block text-sm font-bold text-[#634323]" htmlFor="offline-limit">Limite de produção offline</label>
            <p className="mt-1 text-xs text-[#91795c]">Define por quanto tempo seu império continua produzindo quando você sai.</p>
            <select id="offline-limit" value={game.offlineHours} onChange={(event) => changeOfflineLimit(Number(event.target.value))} className="mt-3 w-full rounded-xl border border-[#dfceb0] bg-white px-3 py-3 text-sm font-semibold text-[#634323] outline-none focus:border-[#a97837] focus:ring-2 focus:ring-[#e9d3a9]">
              <option value={8}>8 horas</option><option value={24}>24 horas</option><option value={48}>48 horas</option>
            </select>
            <div className="mt-6 grid grid-cols-2 gap-2">
              <button type="button" onClick={exportProgress} className="rounded-xl border border-[#d9c39e] bg-[#fbf3e3] px-3 py-3 text-sm font-bold text-[#76502e] hover:bg-[#f3e5ca]">Exportar save</button>
              <button type="button" onClick={() => { setSaveText(""); setModal("import"); }} className="rounded-xl border border-[#d9c39e] bg-[#fbf3e3] px-3 py-3 text-sm font-bold text-[#76502e] hover:bg-[#f3e5ca]">Importar save</button>
            </div>
            <button type="button" onClick={resetGame} className="mt-3 w-full rounded-xl border border-[#dbb6a4] px-3 py-3 text-sm font-bold text-[#9a4f36] transition hover:bg-[#fbede6]">Reiniciar progresso…</button>
            <p className="mt-4 text-center text-[10px] text-[#aa9577]">Seu progresso é salvo automaticamente neste navegador.</p>
          </section>
        </div>
      )}
      {(modal === "export" || modal === "import") && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-[#321b12]/60 p-0 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal("settings"); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="save-dialog-title" className="w-full max-w-xl rounded-t-3xl border border-[#e7d5b4] bg-[#fffaf0] p-5 shadow-2xl sm:rounded-3xl sm:p-6">
            <div className="flex items-start justify-between">
              <div><p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#a07948]">Backup portátil</p><h2 id="save-dialog-title" className="mt-1 font-serif text-2xl font-bold text-[#482d1a]">{modal === "export" ? "Exportar progresso" : "Importar progresso"}</h2></div>
              <button type="button" onClick={() => setModal("settings")} aria-label="Voltar às configurações" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f2e8d7] text-xl hover:bg-[#ead9bc]">×</button>
            </div>
            <p className="mt-2 text-xs text-[#91795c]">{modal === "export" ? "Copie este texto e guarde-o em um lugar seguro." : "Cole abaixo o conteúdo JSON de um save exportado."}</p>
            <textarea value={saveText} onChange={(event) => setSaveText(event.target.value)} readOnly={modal === "export"} className="mt-4 h-48 w-full resize-y rounded-xl border border-[#dfceb0] bg-[#fffdf8] p-3 font-mono text-xs text-[#684b2f] outline-none focus:border-[#a97837] focus:ring-2 focus:ring-[#e9d3a9]" aria-label="Conteúdo do save" />
            <div className="mt-3 flex justify-end gap-2">
              <button type="button" onClick={() => setModal("settings")} className="rounded-xl px-4 py-2.5 text-sm font-bold text-[#876b4a] hover:bg-[#f3eadb]">Voltar</button>
              {modal === "export" ? (
                <button type="button" onClick={() => {
                  if (!navigator.clipboard?.writeText) {
                    setMessage("Não foi possível copiar automaticamente. Selecione e copie o texto.");
                    return;
                  }
                  void navigator.clipboard.writeText(saveText)
                    .then(() => setMessage("Save copiado para a área de transferência."))
                    .catch(() => setMessage("Não foi possível copiar automaticamente. Selecione e copie o texto."));
                }} className="rounded-xl bg-[#81502c] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#694022]">Copiar save</button>
              ) : (
                <button type="button" onClick={importProgress} className="rounded-xl bg-[#81502c] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#694022]">Validar e importar</button>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
