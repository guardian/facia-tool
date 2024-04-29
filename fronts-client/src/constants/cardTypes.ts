export const CardTypesMap = {
  SNAP_LINK: 'snap-link',
  ARTICLE: 'article',
  RECIPE: 'recipe',
} as const;

export type CardTypes = (typeof CardTypesMap)[keyof typeof CardTypesMap];
