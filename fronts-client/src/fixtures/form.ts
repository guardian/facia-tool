import {
	stateWithCollection,
	capiArticle,
	capiArticleWithVideo,
} from 'fixtures/shared';

const state = {
	...stateWithCollection,
	featureSwitches: {},
	externalArticles: {
		data: {
			'article/live/0': capiArticle,
		},
	},
};

const stateWithVideoArticle = {
	...stateWithCollection,
	featureSwitches: {},
	externalArticles: {
		data: {
			'article/live/0': capiArticleWithVideo,
		},
	},
};

export { state, stateWithVideoArticle };
