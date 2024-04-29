import { createSelector } from 'reselect';
import { selectCard, selectExternalArticleFromCard } from './shared';
import { validateId } from 'util/snap';
import { CardTypesMap } from 'constants/cardTypes';
import { getContributorImage } from 'util/CAPIUtils';

const createSelectCardType = () =>
  createSelector(selectCard, (card) => {
    return card && validateId(card.id)
      ? CardTypesMap.SNAP_LINK
      : CardTypesMap.ARTICLE;
  });

const createSelectCutoutUrl = () =>
  createSelector(selectExternalArticleFromCard, (externalArticle) => {
    return externalArticle && getContributorImage(externalArticle);
  });

export { createSelectCardType, createSelectCutoutUrl };
