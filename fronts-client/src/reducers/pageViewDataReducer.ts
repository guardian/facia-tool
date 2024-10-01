import set from 'lodash/fp/set';
import { PAGE_VIEW_DATA_RECEIVED } from '../actions/PageViewData';
import type { Action } from 'types/Action';
import { PageViewDataPerFront, PageViewStory } from 'types/PageViewData';

export interface State {
	[id: string]: PageViewDataPerFront;
}

const reducer = (state: State = {}, action: Action): State => {
	switch (action.type) {
		case PAGE_VIEW_DATA_RECEIVED: {
			const { frontId, collectionId, data, clearPreviousData } = action.payload;

			// Ensure the front and collection objects are there.
			let newState = set([frontId, 'frontId'], frontId, state);
			newState = set(
				[frontId, 'collections', collectionId, 'collectionId'],
				collectionId,
				newState,
			);

			if (clearPreviousData) {
				const stories = data.reduce(
					(acc, pageViewStory) => {
						acc[pageViewStory.articleId] = pageViewStory;
						return acc;
					},
					{} as { [id: string]: PageViewStory },
				);
				return set(
					[frontId, 'collections', collectionId],
					{ collectionId, stories },
					newState,
				);
			}
			return data.reduce(
				(currentState, story) =>
					set(
						[frontId, 'collections', collectionId, 'stories', story.articleId],
						story,
						currentState,
					),
				newState,
			);
		}
		default: {
			return state;
		}
	}
};

export { reducer };
