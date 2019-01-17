import { ArticleFragmentMeta } from 'shared/types/Collection';
import { DerivedArticle } from 'shared/types/Article';
import { CapiArticle } from 'types/Capi';
import omit from 'lodash/omit';
import compact from 'lodash/compact';
import clamp from 'lodash/clamp';
export interface ArticleFragmentFormData {
  headline: string;
  isBoosted: boolean;
  showQuotedHeadline: boolean;
  showBoostedHeadline: boolean;
  customKicker: string;
  isBreaking: boolean;
  byline: string;
  showByline: boolean;
  trailText: string;
  imageHide: boolean;
  primaryImage: ImageData;
  cutoutImage: ImageData;
  imageCutoutReplace: boolean;
  imageSlideshowReplace: boolean;
  slideshow: Array<ImageData | void> | void;
  showKickerTag: boolean;
  showKickerSection: boolean;
}

export interface ImageData {
  src?: string;
  width?: number;
  height?: number;
  origin?: string;
  thumb?: string;
}

export interface CapiTextFields {
  headline: string;
  trailText: string;
  byline: string;
}

const strToInt = (str: string | void) => (str ? parseInt(str, 10) : undefined);
const intToStr = (int: number | void) => (int ? int.toString() : undefined);

export const getCapiValuesForArticleTextFields = (
  article: CapiArticle | void
): CapiTextFields => {
  if (!article) {
    return {
      headline: '',
      trailText: '',
      byline: ''
    };
  }
  return {
    headline: article.fields.headline || '',
    trailText: article.fields.trailText || '',
    byline: article.fields.byline || ''
  };
};

export const getInitialValuesForArticleFragmentForm = (
  article: DerivedArticle | void
): ArticleFragmentFormData | void => {
  if (!article) {
    return undefined;
  }
  const slideshowBackfill: Array<ImageData | void> = [];
  const slideshow: Array<ImageData | void> = (article.slideshow || []).map(
    image => ({
      ...image,
      width: strToInt(image.width),
      height: strToInt(image.height)
    })
  );
  slideshowBackfill.length = clamp(5 - slideshow.length, 0, 5);
  slideshowBackfill.fill(undefined);
  return article
    ? {
        headline: article.headline || '',
        isBoosted: article.isBoosted || false,
        showQuotedHeadline: article.showQuotedHeadline || false,
        showBoostedHeadline: article.showBoostedHeadline || false,
        showKickerTag: article.showKickerTag || false,
        showKickerSection: article.showKickerSection || false,
        customKicker: article.customKicker || '',
        isBreaking: article.isBreaking || false,
        byline: article.byline || '',
        showByline: article.showByline || false,
        trailText: article.trailText || '',
        imageCutoutReplace: article.imageCutoutReplace || false,
        imageHide: article.imageHide || false,
        imageSlideshowReplace: article.imageSlideshowReplace || false,
        primaryImage: {
          src: article.imageSrc,
          width: strToInt(article.imageSrcWidth),
          height: strToInt(article.imageSrcHeight),
          origin: article.imageSrcOrigin,
          thumb: article.imageSrcThumb
        },
        cutoutImage: {
          src: article.imageCutoutSrc,
          width: strToInt(article.imageCutoutSrcWidth),
          height: strToInt(article.imageCutoutSrcHeight),
          origin: article.imageCutoutSrcOrigin
        },
        slideshow: slideshow.concat(slideshowBackfill)
      }
    : undefined;
};

export const getArticleFragmentMetaFromFormValues = (
  values: ArticleFragmentFormData
): ArticleFragmentMeta => {
  const primaryImage = values.primaryImage || {};
  const cutoutImage = values.cutoutImage || {};
  // Lodash doesn't remove undefined in the type settings here, hence the any.
  const slideshow = compact(values.slideshow as any).map(
    (image: ImageData) => ({
      ...image,
      width: intToStr(image.width),
      height: intToStr(image.height)
    })
  );
  const getStringField = (field: string) => {
    if (field.length === 0) {
      return undefined;
    }
    return field;
  };

  return omit(
    {
      ...values,
      headline: getStringField(values.headline),
      trailText: getStringField(values.trailText),
      byline: getStringField(values.byline),
      imageReplace: !!primaryImage.src && !values.imageHide,
      imageSrc: primaryImage.src,
      imageSrcThumb: primaryImage.thumb,
      imageSrcWidth: intToStr(primaryImage.width),
      imageSrcHeight: intToStr(primaryImage.height),
      imageSrcOrigin: primaryImage.origin,
      imageCutoutSrc: cutoutImage.src,
      imageCutoutSrcWidth: intToStr(cutoutImage.width),
      imageCutoutSrcHeight: intToStr(cutoutImage.height),
      imageCutoutSrcOrigin: cutoutImage.origin,
      slideshow: slideshow.length ? slideshow : undefined
    },
    'primaryImage',
    'cutoutImage'
  );
};
