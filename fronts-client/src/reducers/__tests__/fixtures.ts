export const data = {
	articleId: 'articleId',
	articlePath: 'uk/news/a-story',
	totalHits: 2002,
	data: [
		{
			dateTime: 1238984989,
			count: 345,
		},
		{
			dateTime: 1238985490,
			count: 895,
		},
	],
};

export const state = {
	frontId: {
		frontId: 'frontId',
		collections: {
			collectionId: {
				collectionId: 'collectionId',
				stories: {
					articleId: data,
				},
			},
		},
	},
};
