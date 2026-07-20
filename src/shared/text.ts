/** Trims and collapses internal whitespace; returns undefined for empty/missing input. */
export function textOf(value: string | null | undefined): string | undefined {
  const trimmed = value?.replace(/\s+/g, ' ').trim();
  return trimmed ? trimmed : undefined;
}
