import { selectors } from 'shared/bundles/collectionsBundle';
import {
  selectSharedState,
  createSelectArticleFromArticleFragment
} from 'shared/selectors/shared';
import { selectCollectionConfig } from 'selectors/frontsSelectors';
import { hasMainVideo } from 'shared/util/derivedArticle';
import { isCollectionConfigDynamic } from '../util/frontsUtils';
import { createSelector } from 'reselect';
import { State } from 'types/State';

export const defaultFields = [
  'headline',
  'showQuotedHeadline',
  'showBoostedHeadline',
  'customKicker',
  'isBreaking',
  'byline',
  'showByline',
  'trailText',
  'imageCutoutReplace',
  'imageHide',
  'imageReplace',
  'imageSlideshowReplace',
  'primaryImage',
  'cutoutImage',
  'slideshow'
];

export const supportingFields = [
  'headline',
  'customKicker',
  'isBreaking',
  'showKickerSection',
  'showKickerCustom'
];

const selectIsSupporting = (_: unknown, __: unknown, isSupporting: boolean) =>
  isSupporting;

const selectParentCollectionConfig = (
  state: State,
  articleFragmentId: string
) => {
  const collectionId = selectors.selectParentCollectionOfArticleFragment(
    selectSharedState(state),
    articleFragmentId
  );
  return collectionId ? selectCollectionConfig(state, collectionId) : undefined;
};

export const createSelectFormFieldsForCollectionItem = () => {
  const selectDerivedArticle = createSelectArticleFromArticleFragment();
  const selectDerivedArticleFromRootState = (state: State, id: string) =>
    selectDerivedArticle(selectSharedState(state), id);
  return createSelector(
    selectDerivedArticleFromRootState,
    selectParentCollectionConfig,
    selectIsSupporting,
    (derivedArticle, parentCollectionConfig, isSupporting) => {
      if (!derivedArticle) {
        return [];
      }
      if (isSupporting) {
        return supportingFields;
      }
      const fields = defaultFields.slice();

      if (isCollectionConfigDynamic(parentCollectionConfig)) {
        fields.push('isBoosted');
      }
      if (derivedArticle.liveBloggingNow === 'true') {
        fields.push('showLivePlayable');
      }
      if (hasMainVideo(derivedArticle)) {
        fields.push('showMainVideo');
      }
      return fields;
    }
  );
};
