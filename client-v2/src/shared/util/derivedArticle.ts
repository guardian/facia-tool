import { DerivedArticle } from 'shared/types/Article';
import { oc } from 'ts-optchain';
import { Element } from 'types/Capi';

export const hasMainVideo = (article: DerivedArticle) => {
  return (
    getMainMediaType(article) === 'video' || hasMainMediaVideoAtom(article)
  );
};

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
    return firstAsset && firstAsset.assetType === 'video';
  }

  return (
    typeof mainBlockElement !== 'undefined' &&
    hasMediaAtomMainMedia(mainBlockElement) &&
    isVideo(mainBlockElement)
  );
}
