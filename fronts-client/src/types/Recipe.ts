export interface RecipeImage {
	url: string;
	mediaId?: string;
	cropId?: string;
	source?: string;
	photographer?: string;
	imageType?: string;
	caption?: string;
	mediaApiUri?: string;
	displayCredit?: boolean;
	width?: number;
	height?: number;
}

// Incomplete – add as we need more properties. Eventually, this would
// be useful to derive from a package.
export interface Recipe {
  id: string;
  title: string;
  canonicalArticle: string;
  difficultyLevel: string;
  featuredImage?: RecipeImage; // the latter is an old image format that appears in our test fixtures
  previewImage?: RecipeImage;
  firstPublishedDate?: string;
  lastModifiedDate?: string;
  publishedDate?: string;
}

export interface RecipeIndexData {
	checksum: string;
	recipeUID: string;
	capiArticleId: string;
	sponsorshipCount?: number;
}

export interface RecipePartialIndexContent {
	status: string;
	resolved: number;
	requested: number;
	results: RecipeIndexData[];
}
