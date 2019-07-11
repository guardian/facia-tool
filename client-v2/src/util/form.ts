import omit from 'lodash/omit';
import omitBy from 'lodash/omitBy';
import compact from 'lodash/compact';
import clamp from 'lodash/clamp';
import pickBy from 'lodash/pickBy';
import { isDirty } from 'redux-form';
import { ArticleFragmentMeta } from 'shared/types/Collection';
import { DerivedArticle } from 'shared/types/Article';
import { CapiArticle } from 'types/Capi';
import { State } from 'types/State';
import {
  selectArticleFragment,
  selectSharedState
} from 'shared/selectors/shared';

export interface ArticleFragmentFormData {
  headline: string;
  isBoosted: boolean;
  showQuotedHeadline: boolean;
  showBoostedHeadline: boolean;
  customKicker: string;
  isBreaking: boolean;
  showLivePlayable: boolean;
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
  imageReplace: boolean;
}

export interface ImageData {
  src?: string;
  width?: number;
  height?: number;
  origin?: string;
  thumb?: string;
}

export interface CapiFields {
  headline: string;
  trailText: string;
  byline: string;
  thumbnail?: string | void;
}

const strToInt = (str: string | void) => (str ? parseInt(str, 10) : undefined);
const intToStr = (int: number | void) => (int ? int.toString() : undefined);

export const getCapiValuesForArticleFields = (
  article: CapiArticle | void
): CapiFields => {
  if (!article) {
    return {
      headline: '',
      trailText: '',
      byline: '',
      thumbnail: ''
    };
  }
  return {
    headline: article.fields.headline || '',
    trailText: article.fields.trailText || '',
    byline: article.fields.byline || '',
    thumbnail: article.fields.thumbnail
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
        showLivePlayable: article.showLivePlayable || false,
        byline: article.byline || '',
        showByline: article.showByline || false,
        trailText: article.trailText || '',
        imageCutoutReplace: article.imageCutoutReplace || false,
        imageHide: article.imageHide || false,
        imageReplace: article.imageReplace || false,
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
          origin: article.imageCutoutSrcOrigin,
          thumb: article.imageCutoutSrc
        },
        slideshow: slideshow.concat(slideshowBackfill)
      }
    : undefined;
};

// Because multiple fields in the article meta map to
// a single field in the form, we need a way to map between
// the two models to figure out which meta fields should be
// added to the form output when a form field is dirtied.
const formToMetaFieldMap: { [fieldName: string]: string } = {
  imageSrc: 'primaryImage',
  imageSrcThumb: 'primaryImage',
  imageSrcWidth: 'primaryImage',
  imageSrcHeight: 'primaryImage',
  imageSrcOrigin: 'primaryImage',
  imageCutoutSrc: 'cutoutImage',
  imageCutoutSrcWidth: 'cutoutImage',
  imageCutoutSrcHeight: 'cutoutImage',
  imageCutoutSrcOrigin: 'cutoutImage'
};

export const getImageMetaFromValidationResponse = (image: ImageData) => ({
  imageSrc: image.src,
  imageSrcThumb: image.thumb,
  imageSrcWidth: intToStr(image.width),
  imageSrcHeight: intToStr(image.height),
  imageSrcOrigin: image.origin
});

export const getArticleFragmentMetaFromFormValues = (
  state: State,
  id: string,
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

  const completeMeta = omit(
    {
      ...values,
      headline: getStringField(values.headline),
      trailText: getStringField(values.trailText),
      byline: getStringField(values.byline),
      ...getImageMetaFromValidationResponse(primaryImage),
      imageCutoutSrc: cutoutImage.src,
      imageCutoutSrcWidth: intToStr(cutoutImage.width),
      imageCutoutSrcHeight: intToStr(cutoutImage.height),
      imageCutoutSrcOrigin: cutoutImage.origin,
      slideshow: slideshow.length ? slideshow : undefined
    },
    'primaryImage',
    'cutoutImage'
  );

  // We only return dirtied values.
  const selectIsDirty = isDirty(id);
  const dirtiedFields = pickBy(completeMeta, (_, key) => {
    return selectIsDirty(state, formToMetaFieldMap[key] || key);
  });

  const existingArticleFragment = selectArticleFragment(
    selectSharedState(state),
    id
  );

  const existingArticleFragmentMeta = existingArticleFragment
    ? existingArticleFragment.meta || {}
    : {};

  let newArticleFragmentMeta = {
    ...existingArticleFragmentMeta,
    ...dirtiedFields
  };

  if (!values.customKicker) {
    newArticleFragmentMeta = omit(newArticleFragmentMeta, 'showKickerCustom');
  }

  return omitBy(newArticleFragmentMeta, (value: string | boolean | any[]) => {
    if (Array.isArray(value)) {
      return value.length === 0;
    }
    return value === undefined;
  });
};
