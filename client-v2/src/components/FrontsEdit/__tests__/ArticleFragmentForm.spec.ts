import { reducer, initialize, change } from 'redux-form';
import {
  getArticleFragmentMetaFromFormValues,
  getInitialValuesForArticleFragmentForm
} from '../ArticleFragmentForm';
import derivedArticle from 'fixtures/derivedArticle';
import initialState from 'fixtures/initialState';
import { State } from 'types/State';

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

const createStateWithChangedFormFields = (
  cleanState: State,
  articleId: string,
  fieldValueMap: { [field: string]: any }
) => {
  const formState = reducer(undefined, initialize(articleId, formValues));
  return {
    ...cleanState,
    form: Object.keys(fieldValueMap).reduce(
      (acc, key) => reducer(acc, change(articleId, key, fieldValueMap[key])),
      formState
    )
  };
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
          origin: 'exampleOrigin',
          thumb: 'exampleSrc2'
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
    it('should return nothing if no form values were dirtied', () => {
      const state = createStateWithChangedFormFields(
        initialState,
        'exampleId',
        {}
      );
      expect(
        getArticleFragmentMetaFromFormValues(state, 'exampleId', formValues)
      ).toEqual({});
    });
    it('should derive values, removing the slideshow array if empty', () => {
      const byline = 'Caroline Davies edited';
      const headline =
        "Sister of academic's killer warned police he was mentally ill edited";
      const trailText =
        'Police noted concerns over Femi Nandap, who went on to stab lecturer, but released him edited';
      const state = createStateWithChangedFormFields(
        initialState,
        'exampleId',
        {
          byline,
          headline,
          trailText
        }
      );
      expect(
        getArticleFragmentMetaFromFormValues(state, 'exampleId', {
          ...formValues,
          byline,
          headline,
          trailText
        })
      ).toEqual({
        byline: 'Caroline Davies edited',
        headline:
          "Sister of academic's killer warned police he was mentally ill edited",
        trailText:
          'Police noted concerns over Femi Nandap, who went on to stab lecturer, but released him edited'
      });
    });
    it('should derive values, setting the imageReplace value if necessary', () => {
      const values = {
        primaryImage: {
          src: 'exampleSrc',
          width: 100,
          height: 100,
          origin: 'exampleOrigin',
          thumb: 'exampleThumb'
        }
      };
      const state = createStateWithChangedFormFields(
        initialState,
        'exampleId',
        values
      );
      expect(
        getArticleFragmentMetaFromFormValues(state, 'exampleId', {
          ...formValues,
          ...values
        })
      ).toEqual({
        imageReplace: true,
        imageSrc: 'exampleSrc',
        imageSrcHeight: '100',
        imageSrcOrigin: 'exampleOrigin',
        imageSrcThumb: 'exampleThumb',
        imageSrcWidth: '100'
      });
    });
    it('should remove customKicker and showKickerCustom if the kicker is empty', () => {
      const values = {
        customKicker: '',
        showKickerCustom: true
      };
      const state = createStateWithChangedFormFields(
        initialState,
        'exampleId',
        values
      );
      expect(
        getArticleFragmentMetaFromFormValues(state, 'exampleId', {
          ...formValues,
          ...values
        })
      ).toEqual({});
    });
    it('should handle conversion of string values for images', () => {
      const values = {
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
      };
      const state = createStateWithChangedFormFields(
        initialState,
        'exampleId',
        values
      );
      expect(
        getArticleFragmentMetaFromFormValues(state, 'exampleId', {
          ...formValues,
          ...values
        })
      ).toEqual({
        imageReplace: true,
        imageSrc: 'exampleSrc',
        imageSrcHeight: '100',
        imageSrcOrigin: 'exampleOrigin',
        imageSrcThumb: 'exampleThumb',
        imageSrcWidth: '100',
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
        ]
      });
    });
  });
});
