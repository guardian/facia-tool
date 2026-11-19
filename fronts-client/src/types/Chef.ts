export type ChefContributorType = 'Profile' | 'Byline';

export interface Chef {
	id: string;
	type: ChefContributorType;
	webTitle: string;
	webUrl?: string;
	bylineImageUrl?: string;
	bio?: string;
}

export interface ChefSearchResponse {
	hits: number;
	results: Chef[];
}
