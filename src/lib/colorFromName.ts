const PALETTE = [
  '#F5A524', // amber
  '#F06449', // coral
  '#12726E', // teal
  '#C1502E', // terracotta
  '#4FA69E', // light teal
  '#D9503C', // deep coral
];

export function colorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export function initialFromName(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?';
}
