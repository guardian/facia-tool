export interface Chef {
	id: string;
	type: string;
	sectionId?: string;
	sectionName?: string;
	internalName: string;
	webTitle: string;
	webUrl: string;
	apiUrl: string;
	bio?: string;
	bylineImageUrl?: string;
	bylineLargeImageUrl?: string;
	firstName: string;
	lastName: string;
	twitterHandle?: string;
}
