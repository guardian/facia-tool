import { createSelector } from 'reselect';
import { selectCard, selectExternalArticleFromCard } from './shared';
import { validateId } from 'util/snap';
import { CardTypesMap } from 'constants/cardTypes';
import { isEventGraphicId } from 'constants/eventGraphics';
import { getContributorImage } from 'util/CAPIUtils';

const createSelectCardType = () =>
	createSelector(selectCard, (card) => {
		if (!card) {
			return undefined;
		}

		if (card.cardType) {
			return card.cardType;
		}

		// `cardType` is not persisted -- it isn't a field on the trail we send to
		// the backend -- so for cards restored from a saved collection the type
		// must be derived from the id.
		if (isEventGraphicId(card.id)) {
			return CardTypesMap.EVENT_GRAPHIC;
		}

		return validateId(card.id) ? CardTypesMap.SNAP_LINK : CardTypesMap.ARTICLE;
	});

const createSelectCutoutUrl = () =>
	createSelector(selectExternalArticleFromCard, (externalArticle) => {
		return externalArticle && getContributorImage(externalArticle);
	});

export { createSelectCardType, createSelectCutoutUrl };
