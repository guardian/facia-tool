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
  slideshow: [undefined, undefined, undefined, undefined, undefined],
  showKickerTag: false,
  showKickerSection: false,
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
    it('should handle existing slideshows of any length', () => {
      const exampleImage = {
        src: 'src',
        width: 100,
        height: 100,
        origin: 'origin',
        thumb: 'thumb'
      };
      const slideshow = Array(6).fill(exampleImage);
      const slideshowArticle = {
        ...derivedArticle,
        slideshow
      };
      expect(getInitialValuesForArticleFragmentForm(slideshowArticle)).toEqual({
        ...formValues,
        slideshow
      });
    });
    it('should get number values for all image widths and heights', () => {
      expect(
        getInitialValuesForArticleFragmentForm({
          ...derivedArticle,
          imageSrc: 'exampleSrc1',
          imageSrcHeight: '100',
          imageSrcWidth: '100',
          imageSrcOrigin: 'exampleOrigin',
          imageSrcThumb: 'exampleThumb',
          imageCutoutSrc: 'exampleSrc2',
          imageCutoutSrcHeight: '200',
          imageCutoutSrcWidth: '200',
          imageCutoutSrcOrigin: 'exampleOrigin',
          slideshow: [
            {
              src: 'exampleSrc3',
              height: '300',
              width: '300',
              thumb: 'exampleThumb',
              origin: 'exampleOrigin'
            },
            {
              src: 'exampleSrc4',
              height: '400',
              width: '400',
              thumb: 'exampleThumb',
              origin: 'exampleOrigin'
            }
          ]
        })
      ).toEqual({
        ...formValues,
        primaryImage: {
          src: 'exampleSrc1',
          width: 100,
          height: 100,
          origin: 'exampleOrigin',
          thumb: 'exampleThumb'
        },
        cutoutImage: {
          src: 'exampleSrc2',
          width: 200,
          height: 200,
          origin: 'exampleOrigin'
        },
        slideshow: [
          {
            src: 'exampleSrc3',
            width: 300,
            height: 300,
            origin: 'exampleOrigin',
            thumb: 'exampleThumb'
          },
          {
            src: 'exampleSrc4',
            width: 400,
            height: 400,
            origin: 'exampleOrigin',
            thumb: 'exampleThumb'
          },
          undefined,
          undefined,
          undefined
        ]
      });
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
        showKickerTag: false,
        showKickerSection: false,
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
            width: 100,
            height: 100,
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
        showKickerSection: false,
        showKickerTag: false,
        showQuotedHeadline: false,
        slideshow: undefined,
        trailText:
          'Police noted concerns over Femi Nandap, who went on to stab lecturer, but released him'
      });
    });
    it('should handle conversion of string values for images', () => {
      expect(
        getArticleFragmentMetaFromFormValues({
          ...formValues,
          primaryImage: {
            src: 'exampleSrc',
            width: 100,
            height: 100,
            origin: 'exampleOrigin',
            thumb: 'exampleThumb'
          },
          slideshow: [
            {
              src: 'exampleSrc',
              width: 100,
              height: 100,
              origin: 'exampleOrigin',
              thumb: 'exampleThumb'
            },
            {
              src: 'exampleSrc',
              width: 100,
              height: 100,
              origin: 'exampleOrigin',
              thumb: 'exampleThumb'
            }
          ]
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
        showKickerSection: false,
        showKickerTag: false,
        showQuotedHeadline: false,
        slideshow: [
          {
            src: 'exampleSrc',
            width: '100',
            height: '100',
            origin: 'exampleOrigin',
            thumb: 'exampleThumb'
          },
          {
            src: 'exampleSrc',
            width: '100',
            height: '100',
            origin: 'exampleOrigin',
            thumb: 'exampleThumb'
          }
        ],
        trailText:
          'Police noted concerns over Femi Nandap, who went on to stab lecturer, but released him'
      });
    });
  });
});
