import v4 from 'uuid/v4';
import { Card, CardMeta } from 'shared/types/Collection';
import pick from 'lodash/pick';
import cloneDeep from 'lodash/cloneDeep';

const createFragment = (
  id: string,
  imageHide: boolean = false,
  imageReplace: boolean = false,
  imageCutoutReplace: boolean = false,
  imageCutoutSrc?: string,
  showByline: boolean = false,
  showQuotedHeadline: boolean = false
) => ({
  uuid: v4(),
  id,
  frontPublicationDate: Date.now(),
  meta: {
    ...(imageHide ? { imageHide } : {}),
    ...(imageReplace ? { imageReplace } : {}),
    ...(imageCutoutReplace ? { imageCutoutReplace, imageCutoutSrc } : {}),
    ...(showByline ? { showByline } : {}),
    ...(showQuotedHeadline ? { showQuotedHeadline } : {})
  }
});

// only go one deep
const cloneFragment = (
  fragment: Card,
  fragments: { [id: string]: Card } // all the cards to enable nested rebuilds
): { parent: Card; supporting: Card[] } => {
  const sup = (fragment.meta.supporting || [])
    .map(id => {
      const supportingFragment = fragments[id];
      const { supporting, ...meta } = supportingFragment.meta;
      return cloneFragment(
        {
          ...supportingFragment,
          meta
        },
        fragments
      ).parent;
    })
    .filter((s: Card): s is Card => !!s);

  return {
    parent: {
      ...fragment,
      uuid: v4(),
      meta: {
        ...fragment.meta,
        supporting: sup.map(({ uuid }) => uuid)
      }
    },
    supporting: sup
  };
};

const cloneActiveImageMeta = ({ meta }: Card): CardMeta => {
  const newMeta: CardMeta = {
    imageCutoutReplace: false,
    imageSlideshowReplace: false,
    imageReplace: false
  };
  if (meta.imageReplace) {
    return {
      ...newMeta,
      ...pick(meta, [
        'imageSrc',
        'imageSrcThumb',
        'imageSrcWidth',
        'imageSrcHeight',
        'imageSrcOrigin'
      ]),
      imageReplace: true
    };
  }
  if (meta.imageSlideshowReplace) {
    return {
      ...newMeta,
      slideshow: cloneDeep(meta.slideshow),
      imageSlideshowReplace: true
    };
  }
  if (meta.imageCutoutReplace) {
    return {
      ...newMeta,
      ...pick(meta, [
        'imageCutoutSrc',
        'imageCutoutSrcWidth',
        'imageCutoutSrcHeight',
        'imageCutoutSrcOrigin'
      ]),
      imageCutoutReplace: true
    };
  }
  return {};
};

export { createFragment, cloneFragment, cloneActiveImageMeta };
