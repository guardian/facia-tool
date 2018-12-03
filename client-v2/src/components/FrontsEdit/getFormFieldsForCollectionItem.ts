import { DerivedArticle } from 'shared/types/Article';
import { oc } from 'ts-optchain';
import { Element } from 'types/Capi';
import { selectors } from 'shared/bundles/collectionsBundle';
import { selectSharedState } from 'shared/selectors/shared';
import { State } from 'types/State';
import {
  collectionConfigsSelector,
  getCollectionConfig
} from 'selectors/frontsSelectors';
import { CollectionConfig } from 'types/FaciaApi';

const defaultFields = [
  'headline',
  'isBoosted',
  'showQuotedHeadline',
  'showBoostedHeadline',
  'customKicker',
  'isBreaking',
  'byline',
  'showByline',
  'trailText',
  'imageCutoutReplace',
  'imageHide',
  'imageSlideshowReplace',
  'primaryImage',
  'cutoutImage',
  'slideshow'
];

const supportingFields = [
  'headline',
  'customKicker',
  'href',
  'primaryImage',
  'cutoutImage',
  'isBreaking',
  'showKickerTag',
  'showKickerSection',
  'showKickerCustom'
];

export const getFormFieldsForCollectionItem = (
  state: State,
  article: DerivedArticle,
  isSupporting = false
) => {
  const fields = isSupporting ? supportingFields : defaultFields;
  const sharedState = selectSharedState(state);
  const parentCollectionConfigId = selectors.selectParentCollectionOfArticleFragment(
    sharedState,
    article.id
  );
  const parentCollectionConfig = parentCollectionConfigId
    ? getCollectionConfig(state, parentCollectionConfigId)
    : undefined;
  if (isCollectionConfigDynamic(parentCollectionConfig)) {
    fields.push('isBoosted');
  }
  if (article.liveBloggingNow) {
    fields.push('showLivePlayable');
  }
  if (hasMainVideo(article)) {
    fields.push('showMainVideo');
  }
  return fields;
};

const hasMainVideo = (article: DerivedArticle) => {
  return (
    getMainMediaType(article) === 'video' || hasMainMediaVideoAtom(article)
  );
};

export function isCollectionConfigDynamic(
  config: CollectionConfig | undefined
): boolean {
  return !!(config && config.type.indexOf('dynamic/') === 0);
}

export function getMainMediaType(article: DerivedArticle) {
  const element = (article.elements || []).find(_ => _.relation === 'main');
  return element ? element.type : undefined;
}

export function hasMainMediaVideoAtom(article: DerivedArticle) {
  const mainBlockElement = oc(article).blocks.main.elements([])[0] || undefined;

  function hasMediaAtomMainMedia(blockElement: Element) {
    return oc(blockElement).contentAtomTypeData.atomType() === 'media';
  }

  function isVideo(blockElement: Element) {
    const atomId: string | undefined = oc(
      blockElement
    ).contentAtomTypeData.atomId();
    if (!atomId) {
      return false;
    }
    const atom =
      oc(article)
        .atoms.media([])
        .find(_ => _.id === atomId) || undefined;
    const firstAsset = oc(atom).data.media.assets([])[0] || undefined;
    return firstAsset.assetType === 'video';
  }
  return (
    typeof mainBlockElement !== 'undefined' &&
    hasMediaAtomMainMedia(mainBlockElement) &&
    isVideo(mainBlockElement)
  );
}

// const ifStates = {
//   enableContentOverrides: ['headline', 'trailText', 'byline'],
//   inDynamicCollection: ['isBoosted'],
//   isLiveBlog: ['showLivePlayable'],
//   hasMainVideo: ['showMainVideo']
// };
