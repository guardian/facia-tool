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
import { selectEditMode, selectPriority } from './pathSelectors';
import { FormFields } from 'util/form';
import without from 'lodash/without';

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
] as FormFields[];

export const supportingFields = [
  'headline',
  'customKicker',
  'isBreaking',
  'showKickerSection',
  'showKickerCustom'
] as FormFields[];

export const emailFieldsToExclude = [
  'isBreaking',
  'showLargeHeadline',
  'slideshow',
  'cutoutImage',
  'imageSlideshowReplace',
  'imageCutoutReplace'
] as FormFields[];

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
    selectPriority,
    (
      derivedArticle,
      parentCollectionConfig,
      isSupporting,
      editMode,
      priority
    ) => {
      if (!derivedArticle) {
        return [];
      }
      if (isSupporting) {
        return supportingFields;
      }
      let fields = defaultFields.slice();

      if (isCollectionConfigDynamic(parentCollectionConfig)) {
        fields.push('isBoosted');
      }
      if (derivedArticle.liveBloggingNow === 'true') {
        fields.push('showLivePlayable');
      }
      if (hasMainVideo(derivedArticle)) {
        fields.push('showMainVideo');
      }

      if (priority === 'email') {
        fields = without(fields, ...emailFieldsToExclude);
      }

      if (editMode === 'editions') {
        if (
          derivedArticle.sectionName === 'Sport' ||
          derivedArticle.sectionName === 'Football'
        ) {
          fields.push('sportScore');
        }

        return fields.filter(_ => _ !== 'imageSlideshowReplace');
      } else {
        return fields;
      }
    }
  );
};
