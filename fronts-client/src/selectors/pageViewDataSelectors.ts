import { oc } from 'ts-optchain';
import type { State } from 'types/State';
import { PageViewStory } from 'types/PageViewData';

const selectPageViewData = (state: State) => state.pageViewData;

const selectOpenCollectionsForFront = (
	allCollectionsInAFront: string[],
	openCollectionIds: string[],
): string[] => {
	return allCollectionsInAFront.filter((collection) =>
		openCollectionIds.includes(collection),
	);
};

const selectDataForArticle = (
	state: State,
	articleId: string,
	collectionId: string,
	frontId: string,
): PageViewStory | undefined =>
	oc(state).pageViewData[frontId].collections[collectionId].stories[
		articleId
	]();

export {
	selectPageViewData,
	selectOpenCollectionsForFront,
	selectDataForArticle,
};
