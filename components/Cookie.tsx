"use client";

import { formatNumber } from "@/lib/format";

export type CookieFloat = { id: number; amount: number; left: number; top: number };

export function Cookie({ onClick, floats }: { onClick: () => void; floats: CookieFloat[] }) {
  return (
    <div className="relative flex h-[200px] w-[200px] items-center justify-center min-[420px]:h-[220px] min-[420px]:w-[220px] sm:h-[350px] sm:w-[350px]">
      {floats.map((float) => (
        <span
          key={float.id}
          className="pointer-events-none absolute z-20 animate-bounce whitespace-nowrap text-xl font-black text-[#6d351a] drop-shadow-sm"
          style={{ left: `${float.left}%`, top: `${float.top}%` }}
        >
          +{formatNumber(float.amount)}
        </span>
      ))}
      <div className="absolute h-[80%] w-[80%] rounded-full bg-amber-700/15 blur-2xl" />
      <button
        type="button"
        onClick={onClick}
        aria-label="Clique para produzir cookies"
        className="group relative z-10 h-[82%] w-[82%] rounded-full transition-transform duration-100 hover:scale-[1.035] active:scale-95 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-amber-500"
      >
        <svg viewBox="0 0 300 300" className="h-full w-full overflow-visible drop-shadow-[0_18px_16px_rgba(76,35,17,0.28)]" role="img" aria-hidden="true">
          <defs>
            <radialGradient id="cookieBase" cx="36%" cy="28%" r="78%">
              <stop offset="0%" stopColor="#d99a4b" />
              <stop offset="58%" stopColor="#b96f2c" />
              <stop offset="100%" stopColor="#8a461e" />
            </radialGradient>
            <radialGradient id="cookieShine" cx="31%" cy="22%" r="70%">
              <stop offset="0%" stopColor="#fff2c9" stopOpacity=".58" />
              <stop offset="100%" stopColor="#fff2c9" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="150" cy="150" r="141" fill="#75401f" />
          <circle cx="150" cy="145" r="137" fill="url(#cookieBase)" stroke="#70401f" strokeWidth="4" />
          <circle cx="150" cy="145" r="128" fill="url(#cookieShine)" />
          <path d="M40 111c22-49 71-79 118-77 39 2 79 29 94 66" fill="none" stroke="#f4c37a" strokeLinecap="round" strokeOpacity=".38" strokeWidth="8" />
          <g fill="#59301e">
            <ellipse cx="93" cy="83" rx="13" ry="9" transform="rotate(-28 93 83)" />
            <ellipse cx="165" cy="69" rx="12" ry="8" transform="rotate(22 165 69)" />
            <ellipse cx="214" cy="112" rx="15" ry="10" transform="rotate(-35 214 112)" />
            <ellipse cx="66" cy="150" rx="13" ry="10" transform="rotate(38 66 150)" />
            <ellipse cx="126" cy="125" rx="16" ry="11" transform="rotate(-18 126 125)" />
            <ellipse cx="174" cy="151" rx="14" ry="10" transform="rotate(28 174 151)" />
            <ellipse cx="234" cy="177" rx="11" ry="8" transform="rotate(-18 234 177)" />
            <ellipse cx="97" cy="207" rx="15" ry="10" transform="rotate(17 97 207)" />
            <ellipse cx="151" cy="224" rx="12" ry="9" transform="rotate(-32 151 224)" />
            <ellipse cx="199" cy="211" rx="16" ry="10" transform="rotate(25 199 211)" />
            <ellipse cx="125" cy="174" rx="9" ry="7" transform="rotate(26 125 174)" />
          </g>
          <g fill="#f4c37a" opacity=".8">
            <circle cx="112" cy="59" r="3" /><circle cx="197" cy="83" r="3" />
            <circle cx="82" cy="178" r="3" /><circle cx="185" cy="187" r="3" />
            <circle cx="222" cy="143" r="2.5" /><circle cx="137" cy="244" r="2.5" />
          </g>
        </svg>
        <span className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_3px_12px_rgba(255,230,178,0.25)]" />
      </button>
      <div className="absolute bottom-0 left-1/2 h-4 w-56 -translate-x-1/2 rounded-[50%] bg-[#6a371f]/15 blur-md" />
    </div>
  );
}
