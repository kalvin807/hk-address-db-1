export const unicodeToStr = (unicode: string): string => String.raw`${unicode}`;

export const removeEmpty = (obj: Record<string, never>): Record<string, never> =>
  Object.entries(obj).reduce((a: Record<string, never>, [k, v]) => (v === undefined ? a : ((a[k] = v), a)), {});
