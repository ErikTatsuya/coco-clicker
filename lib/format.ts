export function formatNumber(value: number, maximumFractionDigits = 1) {
  if (!Number.isFinite(value)) return "∞";
  if (value >= 1e15) return value.toExponential(2).replace(".", ",");
  if (value >= 1e6) return new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 2 }).format(value);
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: value < 100 ? maximumFractionDigits : 0 }).format(value);
}

export function formatDuration(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainingSeconds = safeSeconds % 60;
  if (hours) return `${hours}h ${minutes}m`;
  if (minutes) return `${minutes}m ${remainingSeconds}s`;
  return `${remainingSeconds}s`;
}
