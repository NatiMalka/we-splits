export function formatCurrency(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  const display = Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(2);
  return `${display} ₪`;
}

export function formatRoomCode(code: string): string {
  return code.toUpperCase();
}
