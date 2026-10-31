/** 185 → "3 h 5 min", 45 → "45 min". */
export function formatMinutes(total) {
  if (!Number.isFinite(total) || total <= 0) return "0 min";
  const hours = Math.floor(total / 60);
  const minutes = Math.round(total % 60);
  if (!hours) return `${minutes} min`;
  return minutes ? `${hours} h ${minutes} min` : `${hours} h`;
}
/** 2.50 → "2.5", 500 → "500". */
export function formatQuantity(value) {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)));
}
