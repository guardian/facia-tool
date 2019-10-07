import { selectors } from 'shared/bundles/collectionsBundle';
import {
  selectSharedState,
  createSelectArticleFromCard
} from 'shared/selectors/shared';
import { selectCollectionConfig } from 'selectors/frontsSelectors';
import { hasMainVideo } from 'shared/util/externalArticle';
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
  cardId: string
) => {
  const collectionId = selectors.selectParentCollectionOfCard(
    selectSharedState(state),
    cardId
  );
  return collectionId ? selectCollectionConfig(state, collectionId) : undefined;
};

export const createSelectFormFieldsForCard = () => {
  const selectDerivedArticle = createSelectArticleFromCard();
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

      if (
        isCollectionConfigDynamic(parentCollectionConfig) ||
        derivedArticle.isBoosted
      ) {
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
        fields.push('overrideArticleMainMedia');
        if (
          derivedArticle.sectionName === 'Sport' ||
          derivedArticle.sectionName === 'Football'
        ) {
          fields.push('sportScore');
        }
        fields.push('coverCardImageReplace');

        return without(
          fields,
          'imageSlideshowReplace',
          'isBreaking',
          'showLargeHeadline'
        );
      } else {
        return fields;
      }
    }
  );
};
