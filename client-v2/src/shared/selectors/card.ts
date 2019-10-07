import { createSelector } from 'reselect';
import { selectCard, selectExternalArticleFromCard } from './shared';
import { validateId } from 'shared/util/snap';
import CardTypes from 'shared/constants/cardTypes';
import { getContributorImage } from 'util/CAPIUtils';

const createSelectCardType = () =>
  createSelector(
    selectCard,
    card => {
      return card && validateId(card.id)
        ? CardTypes.SNAP_LINK
        : CardTypes.ARTICLE;
    }
  );

const createSelectCutoutUrl = () =>
  createSelector(
    selectExternalArticleFromCard,
    externalArticle => {
      return externalArticle && getContributorImage(externalArticle);
    }
  );

export { createSelectCardType, createSelectCutoutUrl };
