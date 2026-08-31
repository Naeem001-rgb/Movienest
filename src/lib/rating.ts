export function ratingPercent(v?: number): number {
  return v ? Math.round(v * 10) : 0;
}

export function ratingColor(v?: number): string {
  if (!v) return "#db2360";
  if (v >= 7) return "#21d07a";
  if (v >= 4) return "#d2d531";
  return "#db2360";
}
