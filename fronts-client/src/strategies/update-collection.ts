import type { State } from 'types/State';
import { updateCollection } from 'services/faciaApi';
import {
	updateEditionsCollection,
	renameEditionsCollection,
} from 'services/editionsApi';
import { runStrategy } from './run-strategy';
import { CollectionWithNestedArticles } from 'types/Collection';
import { EditionsCollection } from 'types/Edition';

const collectionToEditionCollection = (
	col: CollectionWithNestedArticles,
): EditionsCollection => {
	const { live, draft, isHidden, ...restCol } = col;
	return {
		...restCol,
		isHidden: isHidden || false,
		items: draft || [],
	};
};

const updateCollectionStrategy = (
	state: State,
	id: string,
	collection: CollectionWithNestedArticles,
	renamingCollection: boolean,
) => {
	const curatedPlatformStrategy = () =>
		renamingCollection
			? renameEditionsCollection(id)(collectionToEditionCollection(collection))
			: updateEditionsCollection(id)(collectionToEditionCollection(collection));
	return runStrategy<void>(state, {
		front: () => updateCollection(id)(collection),
		edition: curatedPlatformStrategy,
		feast: curatedPlatformStrategy,
		none: () => null,
	});
};

export { updateCollectionStrategy };
