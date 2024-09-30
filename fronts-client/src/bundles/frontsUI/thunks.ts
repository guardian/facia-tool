import { selectFront } from 'selectors/frontsSelectors';
import { ThunkResult } from 'types/Store';
import { openCollectionsAndFetchTheirArticles } from 'actions/Collections';
import { CardSets } from 'types/Collection';
import { editorCloseCollections } from './';

export const editorOpenAllCollectionsForFront =
	(frontId: string, browsingStage: CardSets): ThunkResult<void> =>
	(dispatch, getState) => {
		const front = selectFront(getState(), { frontId });
		dispatch(
			openCollectionsAndFetchTheirArticles(
				front.collections,
				front.id,
				browsingStage,
			),
		);
	};

export const editorCloseAllCollectionsForFront =
	(frontId: string): ThunkResult<void> =>
	(dispatch, getState) => {
		const front = selectFront(getState(), { frontId });
		dispatch(editorCloseCollections(front.collections));
	};
