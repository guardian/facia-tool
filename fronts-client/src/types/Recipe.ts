export interface Recipe {
	id: string;
	title: string;
	byline: string[];
	firstPublishedDate: string;
	publishedDate: string;
	lastModifiedDate: string;
	imageTemplateUrl?: string;
	canonicalArticle: string;
}

export interface RecipeSearchHit extends Recipe {
	score: number;
}

export interface RecipeSearchResponse {
	hits: number;
	maxScore: number;
	recipes: RecipeSearchHit[];
}
