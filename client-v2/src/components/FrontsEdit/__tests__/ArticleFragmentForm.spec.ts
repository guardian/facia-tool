import {
  getArticleFragmentMetaFromFormValues,
  getInitialValuesForArticleFragmentForm
} from '../ArticleFragmentForm';
import derivedArticle from 'fixtures/derivedArticle';

const formValues = {
  byline: 'Caroline Davies',
  customKicker: '',
  cutoutImage: {
    height: undefined,
    origin: undefined,
    src: undefined,
    width: undefined
  },
  headline: "Sister of academic's killer warned police he was mentally ill",
  imageCutoutReplace: false,
  imageHide: false,
  imageSlideshowReplace: false,
  isBoosted: false,
  isBreaking: false,
  primaryImage: {
    height: undefined,
    origin: undefined,
    src: undefined,
    thumb: undefined,
    width: undefined
  },
  showBoostedHeadline: false,
  showByline: false,
  showQuotedHeadline: false,
  slideshow: [undefined, undefined, undefined, undefined],
  trailText:
    'Police noted concerns over Femi Nandap, who went on to stab lecturer, but released him'
};

describe('ArticleFragmentForm transform functions', () => {
  describe('Derive form values from a derived article', () => {
    it('should derive values', () => {
      expect(getInitialValuesForArticleFragmentForm(derivedArticle)).toEqual(
        formValues
      );
    });
  });
  describe('Derive articleFragment meta from form values', () => {
    it('should derive values, removing the slideshow array if empty', () => {
      expect(getArticleFragmentMetaFromFormValues(formValues)).toEqual({
        byline: 'Caroline Davies',
        customKicker: '',
        headline:
          "Sister of academic's killer warned police he was mentally ill",
        imageCutoutReplace: false,
        imageCutoutSrc: undefined,
        imageCutoutSrcHeight: undefined,
        imageCutoutSrcOrigin: undefined,
        imageCutoutSrcWidth: undefined,
        imageHide: false,
        imageReplace: false,
        imageSlideshowReplace: false,
        imageSrc: undefined,
        imageSrcHeight: undefined,
        imageSrcOrigin: undefined,
        imageSrcThumb: undefined,
        imageSrcWidth: undefined,
        isBoosted: false,
        isBreaking: false,
        showBoostedHeadline: false,
        showByline: false,
        showKickerCustom: false,
        showQuotedHeadline: false,
        slideshow: undefined,
        trailText:
          'Police noted concerns over Femi Nandap, who went on to stab lecturer, but released him'
      });
    });
    it('should derive values, setting the imageReplace value if necessary', () => {
      expect(
        getArticleFragmentMetaFromFormValues({
          ...formValues,
          primaryImage: {
            src: 'exampleSrc',
            width: '100',
            height: '100',
            origin: 'exampleOrigin',
            thumb: 'exampleThumb'
          }
        })
      ).toEqual({
        byline: 'Caroline Davies',
        customKicker: '',
        headline:
          "Sister of academic's killer warned police he was mentally ill",
        imageCutoutReplace: false,
        imageCutoutSrc: undefined,
        imageCutoutSrcHeight: undefined,
        imageCutoutSrcOrigin: undefined,
        imageCutoutSrcWidth: undefined,
        imageHide: false,
        imageReplace: true,
        imageSlideshowReplace: false,
        imageSrc: 'exampleSrc',
        imageSrcHeight: '100',
        imageSrcOrigin: 'exampleOrigin',
        imageSrcThumb: 'exampleThumb',
        imageSrcWidth: '100',
        isBoosted: false,
        isBreaking: false,
        showBoostedHeadline: false,
        showByline: false,
        showKickerCustom: false,
        showQuotedHeadline: false,
        slideshow: undefined,
        trailText:
          'Police noted concerns over Femi Nandap, who went on to stab lecturer, but released him'
      });
    });
  });
});
