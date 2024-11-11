import { Card, NestedCard } from 'types/Collection';
import { selectClipboard } from 'selectors/frontsSelectors';
import type { State } from 'types/State';
import { normalize, denormalize } from './clipboardSchema';
import { notLiveLabels } from 'constants/fronts';

function normaliseClipboard(clipboard: { articles: NestedCard[] }): {
	clipboard: { articles: string[] };
	cards: { [id: string]: Card };
} {
	const normalisedClipboard = normalize(clipboard);
	return {
		clipboard: normalisedClipboard.result,
		cards: normalisedClipboard.entities.cards || {},
	};
}

function denormaliseClipboard(state: State): { articles: NestedCard[] } {
	const clipboard = selectClipboard(state);

	return denormalize({ articles: clipboard }, { cards: state.cards });
}

const getArticleLabel = (
	firstPublicationDate?: string,
	sectionName?: string,
	isLive?: boolean,
) => {
	if (isLive) {
		return sectionName;
	}

	if (firstPublicationDate) {
		return notLiveLabels.takenDown;
	}

	return notLiveLabels.draft;
};

export { normaliseClipboard, denormaliseClipboard, getArticleLabel };
