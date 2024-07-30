import { selectors } from 'bundles/collectionsBundle';
import { createSelectArticleFromCard } from 'selectors/shared';
import { selectCollectionConfig } from 'selectors/frontsSelectors';
import { hasMainVideo } from 'util/externalArticle';
import {
  isCollectionConfigDynamic,
  isCollectionConfigDynamicV1,
  isCollectionConfigDynamicV2,
} from '../util/frontsUtils';
import { createSelector } from 'reselect';
import type { State } from 'types/State';
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
  'slideshow',
] as FormFields[];

export const supportingFields = [
  'headline',
  'customKicker',
  'isBreaking',
  'showKickerSection',
  'showKickerCustom',
] as FormFields[];

export const htmlSnapFields = [
  'headline',
  'primaryImage',
  'cutoutImage',
  'imageCutoutReplace',
  'imageHide',
  'imageReplace',
];

export const emailFieldsToExclude = [
  'isBreaking',
  'showLargeHeadline',
  'slideshow',
  'imageSlideshowReplace',
] as FormFields[];

const selectIsSupporting = (_: unknown, __: unknown, isSupporting: boolean) =>
  isSupporting;

const selectParentCollectionConfig = (state: State, cardId: string) => {
  const collectionId = selectors.selectParentCollectionOfCard(state, cardId);
  return collectionId ? selectCollectionConfig(state, collectionId) : undefined;
};

export const createSelectFormFieldsForCard = () => {
  const selectDerivedArticle = createSelectArticleFromCard();
  const selectDerivedArticleFromRootState = (state: State, id: string) =>
    selectDerivedArticle(state, id);
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
      if (derivedArticle.snapType === 'html') {
        return htmlSnapFields;
      }
      if (isSupporting) {
        return supportingFields;
      }
      let fields = defaultFields.slice();

      if (
        isCollectionConfigDynamicV2(parentCollectionConfig) ||
        derivedArticle.boostLevel
      ) {
        fields.push('boostLevel');
        fields = without(fields, 'showLargeHeadline');
      }
      if (isCollectionConfigDynamicV1(parentCollectionConfig)) {
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
