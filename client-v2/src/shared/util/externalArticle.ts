import { oc } from 'ts-optchain';
import { Element } from 'types/Capi';
import { ExternalArticle } from 'shared/types/ExternalArticle';
import { DerivedArticle } from 'shared/types/Article';

export const hasMainVideo = (article: ExternalArticle | DerivedArticle) => {
  return (
    hasMainMediaVideoAtom(article) ||
    getArticleMainElementType(article) === 'video'
  );
};

// this function probably refers to old-style video pages which have a main element of type video
export function getArticleMainElementType(
  article: ExternalArticle | DerivedArticle
) {
  const element = (article.elements || []).find(_ => _.relation === 'main');
  return element ? element.type : undefined;
}

export function hasMainMediaVideoAtom(
  article: ExternalArticle | DerivedArticle
) {
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
    return firstAsset && firstAsset.assetType === 'video';
  }

  return (
    typeof mainBlockElement !== 'undefined' &&
    hasMediaAtomMainMedia(mainBlockElement) &&
    isVideo(mainBlockElement)
  );
}
