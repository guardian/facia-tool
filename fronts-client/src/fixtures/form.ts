import {
	stateWithCollection,
	capiArticle,
	capiArticleWithVideo,
} from 'fixtures/shared';

const state = {
	...stateWithCollection,
	externalArticles: {
		data: {
			'article/live/0': capiArticle,
		},
	},
};

const stateWithVideoArticle = {
	...stateWithCollection,
	externalArticles: {
		data: {
			'article/live/0': capiArticleWithVideo,
		},
	},
};

export { state, stateWithVideoArticle };
