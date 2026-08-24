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
  lines.push(`טיפ (${totals.tipPercentageUsed}%) — ${formatCurrency(totals.tipAmount)}`);
  lines.push(`סה"כ לתשלום: ${formatCurrency(totals.total)}`);
  return `${participantName ? `${participantName}\n` : ''}${lines.join('\n')}`;
}

export function buildWhatsAppShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
