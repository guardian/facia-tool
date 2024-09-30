export const CardTypesMap = {
	SNAP_LINK: 'snap-link',
	ARTICLE: 'article',
	RECIPE: 'recipe',
	CHEF: 'chef',
	FEAST_COLLECTION: 'feast-collection',
} as const;

export type CardTypes = (typeof CardTypesMap)[keyof typeof CardTypesMap];
