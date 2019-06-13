import { createSelector } from 'reselect';
import {
  articleFragmentSelector,
  externalArticleFromArticleFragmentSelector
} from './shared';
import { validateId } from 'shared/util/snap';
import CollectionItemTypes from 'shared/constants/collectionItemTypes';
import { getContributorImage } from 'util/CAPIUtils';

const createCollectionItemTypeSelector = () =>
  createSelector(
    articleFragmentSelector,
    articleFragment => {
      return articleFragment && validateId(articleFragment.id)
        ? CollectionItemTypes.SNAP_LINK
        : CollectionItemTypes.ARTICLE;
    }
  );

const createSelectActiveImageUrl = () =>
  createSelector(
    articleFragmentSelector,
    externalArticleFromArticleFragmentSelector,
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
    externalArticleFromArticleFragmentSelector,
    externalArticle => {
      return externalArticle && getContributorImage(externalArticle);
    }
  );

export {
  createCollectionItemTypeSelector,
  createSelectActiveImageUrl,
  createSelectCutoutUrl
};
