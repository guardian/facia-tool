import v4 from 'uuid/v4';
import { Card, CardMeta } from 'shared/types/Collection';
import pick from 'lodash/pick';
import cloneDeep from 'lodash/cloneDeep';

const createCard = (
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
const cloneCard = (
  card: Card,
  cards: { [id: string]: Card } // all the cards to enable nested rebuilds
): { parent: Card; supporting: Card[] } => {
  const sup = (card.meta.supporting || [])
    .map(id => {
      const supportingCard = cards[id];
      const { supporting, ...meta } = supportingCard.meta;
      return cloneCard(
        {
          ...supportingCard,
          meta
        },
        cards
      ).parent;
    })
    .filter((s: Card): s is Card => !!s);

  return {
    parent: {
      ...card,
      uuid: v4(),
      meta: {
        ...card.meta,
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

export { createCard, cloneCard, cloneActiveImageMeta };
