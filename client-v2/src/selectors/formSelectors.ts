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
import { selectEditMode } from './pathSelectors';

export const defaultFields = [
  'headline',
  'showQuotedHeadline',
  'showLargeHeadline',
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
    selectEditMode,
    (derivedArticle, parentCollectionConfig, isSupporting, editMode) => {
      if (!derivedArticle) {
        return [];
      }
      if (isSupporting) {
        return supportingFields;
      }
      const fields = defaultFields.slice();

      if (
        editMode === 'editions' &&
        (derivedArticle.sectionName === 'Sport' ||
          derivedArticle.sectionName === 'Football')
      ) {
        fields.push('sportScore');
      }

      if (isCollectionConfigDynamic(parentCollectionConfig)) {
        fields.push('isBoosted');
      }
      if (derivedArticle.liveBloggingNow === 'true') {
        fields.push('showLivePlayable');
      }
      if (hasMainVideo(derivedArticle)) {
        fields.push('showMainVideo');
      }

      if (editMode === 'editions') {
        return fields.filter(_ => _ !== 'imageSlideshowReplace');
      } else {
        return fields;
      }
    }
  );
};
