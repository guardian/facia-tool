// @flow

import omit from 'lodash/omit';
import compact from 'lodash/compact';

import { getURLInternalPageCode } from 'util/CAPIUtils';

const urlToArticle = async (text: string) => {
  const id = await getURLInternalPageCode(text);

  return id
    ? {
        id,
        type: 'articleFragment'
      }
    : 'Can`t covert text to article';
};

const defaultMeta = {};

const getInitialValuesForArticleFragmentForm = (
  externalArticle: ExternalArticle,
  articleFragment: ArticleFragment
) => {
  const slideshowBackfill = [];
  const slideshow = articleFragment.meta.slideshow || [];
  slideshowBackfill.length = 4 - slideshow.length;
  slideshowBackfill.fill(undefined);
  return articleFragment && externalArticle
    ? {
        ...externalArticle,
        ...articleFragment.meta,
        primaryImage: {
          src: articleFragment.meta.imageSrc,
          width: articleFragment.meta.imageSrcWidth,
          height: articleFragment.meta.imageSrcHeight,
          origin: articleFragment.meta.imageSrcOrigin,
          thumb: articleFragment.meta.imageSrcThumb
        },
        cutoutImage: {
          src: articleFragment.meta.imageCutoutSrc,
          width: articleFragment.meta.imageCutoutSrcWidth,
          height: articleFragment.meta.imageCutoutSrcHeight,
          origin: articleFragment.meta.imageCutoutSrcOrigin
        },
        slideshow: slideshow.concat(slideshowBackfill)
      }
    : defaultMeta;
};

const getArticleFragmentMetaFromFormValues = (
  values: FormValues
): ArticleFragment.meta =>
  omit(
    {
      ...values,
      showKickerCustom: !!values.customKicker,
      imageSrc: values.primaryImage.src,
      imageSrcThumb: values.primaryImage.thumb,
      imageSrcWidth: values.primaryImage.width,
      imageSrcHeight: values.primaryImage.height,
      imageSrcOrigin: values.primaryImage.origin,
      imageCutoutSrc: values.cutoutImage.src,
      imageCutoutSrcWidth: values.cutoutImage.width,
      imageCutoutSrcHeight: values.cutoutImage.height,
      imageCutoutSrcOrigin: values.cutoutImage.origin,
      slideshow: compact(values.slideshow)
    },
    'primaryImage',
    'cutoutImage'
  );

export {
  urlToArticle,
  getInitialValuesForArticleFragmentForm,
  getArticleFragmentMetaFromFormValues
};
