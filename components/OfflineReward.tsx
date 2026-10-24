"use client";

import { formatDuration, formatNumber } from "@/lib/format";

export function OfflineReward({ seconds, reward, onClose }: { seconds: number; reward: number; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#321b12]/60 p-4 backdrop-blur-sm">
      <section role="dialog" aria-modal="true" aria-labelledby="offline-title" className="w-full max-w-md overflow-hidden rounded-3xl border border-[#e7d5b4] bg-[#fffaf0] text-center shadow-2xl">
        <div className="bg-gradient-to-br from-[#f6e5c1] to-[#f1d6a2] px-7 pb-7 pt-8">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/60 bg-[#fff8e8] text-4xl shadow-inner">🍪</div>
          <p className="mt-5 text-[10px] font-bold uppercase tracking-[.24em] text-[#a07948]">Enquanto você descansava</p>
          <h2 id="offline-title" className="mt-2 font-serif text-3xl font-bold text-[#482d1a]">Que bom ter você de volta!</h2>
        </div>
        <div className="px-7 pb-7 pt-6">
          <p className="text-sm text-[#826548]">Seu império trabalhou por <strong className="text-[#603d22]">{formatDuration(seconds)}</strong> e produziu</p>
          <p className="mt-2 font-serif text-4xl font-black text-[#aa6b24]">+{formatNumber(reward)}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-[#a88a62]">cookies fresquinhos</p>
          <button type="button" onClick={onClose} className="mt-7 w-full rounded-xl bg-[#81502c] px-5 py-3 text-sm font-bold text-[#fff8e9] shadow-md transition hover:bg-[#694022] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700">Voltar ao forno</button>
        </div>
      </section>
    </div>
  );
}
