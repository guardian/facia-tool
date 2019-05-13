import { createSelector } from 'reselect';
import { articleFragmentSelector } from './shared';
import { validateId } from 'shared/util/snap';
import CollectionItemTypes from 'shared/constants/collectionItemTypes';

const createCollectionItemTypeSelector = () =>
  createSelector(
    articleFragmentSelector,
    articleFragment => {
      return articleFragment && validateId(articleFragment.id)
        ? CollectionItemTypes.SNAP_LINK
        : CollectionItemTypes.ARTICLE;
    }
  );

export { createCollectionItemTypeSelector };
