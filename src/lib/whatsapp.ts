import type { ParticipantTotal } from './calc/splitEngine';
import { formatCurrency } from './format';

export function buildSummaryShareText(
  participantName: string,
  restaurantName: string | null,
  totals: ParticipantTotal,
): string {
  const lines = [
    `הסיכום שלי${restaurantName ? ` מ${restaurantName}` : ''}:`,
    ...totals.itemBreakdown.map((line) => `${line.itemName} — ${formatCurrency(line.amount)}`),
  ];
  if (totals.serviceShare > 0) lines.push(`דמי שירות — ${formatCurrency(totals.serviceShare)}`);
  if (totals.tipAmount > 0) lines.push(`טיפ (${totals.tipPercentageUsed}%) — ${formatCurrency(totals.tipAmount)}`);
  if (Math.abs(totals.roundingAdjustment) >= 0.01) {
    const sign = totals.roundingAdjustment > 0 ? '+' : '−';
    lines.push(`עיגול — ${sign}${formatCurrency(Math.abs(totals.roundingAdjustment))}`);
  }
  lines.push(`סה"כ לתשלום: ${formatCurrency(totals.total)}`);
  return `${participantName ? `${participantName}\n` : ''}${lines.join('\n')}`;
}

export function buildWhatsAppShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
