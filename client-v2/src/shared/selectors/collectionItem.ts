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

const createSelectActiveImageUrl = () =>
  createSelector(
    selectArticleFragment,
    selectExternalArticleFromArticleFragment,
    (articleFragment, externalArticle): string | undefined => {
      if (!articleFragment || !articleFragment.meta) {
        return;
      }
      if (articleFragment.meta.imageReplace) {
        return articleFragment.meta.imageSrcOrigin;
      }
      if (articleFragment.meta.imageCutoutReplace) {
        return articleFragment.meta.imageCutoutSrcOrigin;
      }
      if (articleFragment.meta.imageSlideshowReplace) {
        return (
          articleFragment.meta.slideshow &&
          articleFragment.meta.slideshow[0] &&
          articleFragment.meta.slideshow[0].origin
        );
      }
      return externalArticle && externalArticle.fields.thumbnail
        ? externalArticle.fields.thumbnail
        : undefined;
    }
  );

const createSelectCutoutUrl = () =>
  createSelector(
    selectExternalArticleFromArticleFragment,
    externalArticle => {
      return externalArticle && getContributorImage(externalArticle);
    }
  );

export {
  createSelectCollectionItemType,
  createSelectActiveImageUrl,
  createSelectCutoutUrl
};
