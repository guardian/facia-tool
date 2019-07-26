import { createSelector } from 'reselect';
import {
  selectArticleFragment,
  selectExternalArticleFromArticleFragment
} from './shared';
import { validateId } from 'shared/util/snap';
import CollectionItemTypes from 'shared/constants/collectionItemTypes';
import { getContributorImage } from 'util/CAPIUtils';

const createSelectCollectionItemType = () =>
  createSelector(
    selectArticleFragment,
    articleFragment => {
      return articleFragment && validateId(articleFragment.id)
        ? CollectionItemTypes.SNAP_LINK
        : CollectionItemTypes.ARTICLE;
    }
  );

const createSelectCutoutUrl = () =>
  createSelector(
    selectExternalArticleFromArticleFragment,
    externalArticle => {
      return externalArticle && getContributorImage(externalArticle);
    }
  );

export { createSelectCollectionItemType, createSelectCutoutUrl };
