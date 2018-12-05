import React from 'react';
import { connect } from 'react-redux';
import {
  reduxForm,
  Field,
  FieldArray,
  InjectedFormProps,
  formValueSelector,
  WrappedFieldArrayProps
} from 'redux-form';
import styled from 'styled-components';
import omit from 'lodash/omit';
import compact from 'lodash/compact';
import Button from 'shared/components/input/ButtonDefault';
import ContentContainer from 'shared/components/layout/ContentContainer';
import ContainerHeadingPinline from 'shared/components/typography/ContainerHeadingPinline';
import {
  createArticleFromArticleFragmentSelector,
  selectSharedState,
  articleTagSelector
} from 'shared/selectors/shared';
import { DerivedArticle } from 'shared/types/Article';
import { ArticleFragmentMeta, ArticleTag } from 'shared/types/Collection';
import InputText from 'shared/components/input/InputText';
import InputTextArea from 'shared/components/input/InputTextArea';
import HorizontalRule from 'shared/components/layout/HorizontalRule';
import InputCheckboxToggle from 'shared/components/input/InputCheckboxToggle';
import InputImage from 'shared/components/input/InputImage';
import InputGroup from 'shared/components/input/InputGroup';
import InputButton from 'shared/components/input/InputButton';
import Row from '../Row';
import Col from '../Col';
import { State } from 'types/State';

interface ComponentProps {
  onCancel: () => void;
  onSave: (meta: ArticleFragmentMeta) => void;
  imageSlideshowReplace: boolean;
  showByline: boolean;
  imageCutoutReplace: boolean;
  imageHide: boolean;
  kickerOptions: ArticleTag;
  articleFragmentId: string;
  showKickerTag: boolean;
  showKickerSection: boolean;
}

type Props = ComponentProps &
  InjectedFormProps<ArticleFragmentFormData, ComponentProps, {}>;

interface ImageData {
  src?: string;
  width?: number;
  height?: number;
  origin?: string;
  thumb?: string;
}
interface ArticleFragmentFormData {
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
  showKickerSection: boolean
}

const FormContainer = ContentContainer.withComponent('form').extend`
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 380px;
  margin-left: 10px;
  height: 100%;
`;

const FormContent = styled('div')`
  flex: 1;
  overflow-y: scroll;
`;

const CollectionHeadingPinline = ContainerHeadingPinline.extend`
  display: flex;
  margin-right: -11px;
  margin-bottom: 10px;
`;

const RowContainer = styled('div')`
  overflow: hidden;
`;

const ButtonContainer = styled('div')`
  margin-left: auto;
  line-height: 0;
`;

const SlideshowRow = Row.extend`
  margin-top: 10px;
  margin-bottom: 5px;
`;

const SlideshowLabel = styled('div')`
  font-size: 12px;
  color: #767676;
`;

const ImageWrapper = styled('div')`
  transition: opacity 0.15s;
  opacity: ${(props: { faded: boolean }) => (props.faded ? 0.6 : 1)};
`;

const imageCriteria = {
  minWidth: 400,
  widthAspectRatio: 5,
  heightAspectRatio: 3
};

const renderSlideshow: React.StatelessComponent<
  WrappedFieldArrayProps<ImageData>
> = ({ fields }) => (
  <>
    {fields.map((name, index) => (
      <Col key={`${name}-${index}`}>
        <Field
          name={name}
          component={InputImage}
          size="small"
          criteria={imageCriteria}
        />
      </Col>
    ))}
  </>
);

const formComponent: React.StatelessComponent<Props> = ({
  change,
  kickerOptions,
  handleSubmit,
  imageSlideshowReplace,
  imageHide,
  imageCutoutReplace,
  onCancel,
  initialValues,
  pristine,
  showByline,
  reset,
  showKickerTag,
  showKickerSection
}) => (
  <FormContainer onSubmit={handleSubmit}>
    <CollectionHeadingPinline>
      Edit
      <ButtonContainer>
        <Button priority="primary" onClick={onCancel} type="button" size="l">
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={pristine} size="l">
          Save
        </Button>
      </ButtonContainer>
    </CollectionHeadingPinline>
    <FormContent>
      <InputGroup>
        <Field
          name="headline"
          label="Headline"
          placeholder={initialValues.headline}
          component={InputTextArea}
          useHeadlineFont
          rows="2"
        />
        <Field
          name="isBoosted"
          component={InputCheckboxToggle}
          label="Boost"
          type="checkbox"
        />
        <HorizontalRule noMargin />
        <Field
          name="showQuotedHeadline"
          component={InputCheckboxToggle}
          label="Quote headline"
          type="checkbox"
        />
        <HorizontalRule noMargin />
        <Field
          name="showBoostedHeadline"
          component={InputCheckboxToggle}
          label="Large headline"
          type="checkbox"
        />
        <HorizontalRule noMargin />
        <Field
          name="customKicker"
          label="Kicker"
          component={InputText}
          placeholder="Add custom kicker"
          useHeadlineFont
          format={value => {
            if (showKickerTag) {
              return kickerOptions.webTitle
            }
            if (showKickerSection) {
              return kickerOptions.sectionName
            }
            return value;
          }}
          onChange={(e) => {
            change('showKickerCustom', true)
            change('showKickerTag', false)
            change('showKickerSection', false)
            if (e) {
              change('customKicker', e.target.value)
            }
          }}
        />
        { kickerOptions.webTitle && (
          <Field
            name="showKickerTag"
            component={InputButton}
            buttonText={kickerOptions.webTitle}
            onClick={() => {
              change('showKickerTag', true)
              change('showKickerSection', false)
              change('showKickerCustom', false)
            }}
          />
        )}
        { kickerOptions.sectionName && (
          <Field
            name="showKickerSection"
            component={InputButton}
            buttonText={kickerOptions.sectionName}
            onClick={() => {
              change('showKickerSection', true)
              change('showKickerTag', false)
              change('showKickerCustom', false)
            }}
          />
        )}
        <Field
          name="isBreaking"
          component={InputCheckboxToggle}
          label="Breaking News"
          type="checkbox"
        />
        <HorizontalRule noMargin />
        <Field
          name="showByline"
          component={InputCheckboxToggle}
          label="Show Byline"
          type="checkbox"
        />
        {showByline && (
          <Field
            name="byline"
            label="Byline"
            component={InputText}
            placeholder="Replace byline"
            useHeadlineFont
          />
        )}
        <HorizontalRule noMargin />
        <Field
          name="trailText"
          label="Standfirst"
          component={InputTextArea}
          placeholder="Replace standfirst"
        />
      </InputGroup>
      <RowContainer>
        <Row>
          <Col>
            <ImageWrapper faded={imageHide}>
              <Field
                name="primaryImage"
                component={InputImage}
                disabled={imageHide}
              />
            </ImageWrapper>
          </Col>
          <Col>
            <InputGroup>
              <Field
                name="imageHide"
                component={InputCheckboxToggle}
                label="Hide media"
                type="checkbox"
                default={false}
              />
            </InputGroup>
          </Col>
        </Row>
        <HorizontalRule />
        <Row>
          <Col>
            <ImageWrapper faded={!imageCutoutReplace}>
              <Field
                name="cutoutImage"
                component={InputImage}
                disabled={imageHide}
              />
            </ImageWrapper>
          </Col>
          <Col>
            <InputGroup>
              <Field
                name="imageCutoutReplace"
                component={InputCheckboxToggle}
                label="Use cutout"
                type="checkbox"
                default={false}
              />
            </InputGroup>
          </Col>
        </Row>
      </RowContainer>
      <HorizontalRule />
      <Field
        name="imageSlideshowReplace"
        component={InputCheckboxToggle}
        label="Slideshow"
        type="checkbox"
      />
      {imageSlideshowReplace && (
        <RowContainer>
          <SlideshowRow>
            <FieldArray name="slideshow" component={renderSlideshow} />
          </SlideshowRow>
          <SlideshowLabel>Drag and drop up to four images</SlideshowLabel>
        </RowContainer>
      )}
    </FormContent>
  </FormContainer>
);

const strToInt = (str: string | void) => (str ? parseInt(str, 10) : undefined);
const intToStr = (int: number | void) => (int ? int.toString() : undefined);

const getInitialValuesForArticleFragmentForm = (
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
  slideshowBackfill.length = 4 - slideshow.length;
  slideshowBackfill.fill(undefined);
  return article
    ? {
        headline: article.headline || '',
        isBoosted: article.isBoosted || false,
        showQuotedHeadline: article.showQuotedHeadline || false,
        showBoostedHeadline: article.showBoostedHeadline || false,
        customKicker: article.customKicker || '',
        showKickerTag: article.showKickerTag || false,
        showKickerSection: article.showKickerSection || false,
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

const getArticleFragmentMetaFromFormValues = (
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
  return omit(
    {
      ...values,
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

const ArticleFragmentForm = reduxForm<
  ArticleFragmentFormData,
  ComponentProps,
  {}
>({
  destroyOnUnmount: false,
  enableReinitialize: true,
  onSubmit: (values: ArticleFragmentFormData, _, props: ComponentProps) => {
    const meta: ArticleFragmentMeta = getArticleFragmentMetaFromFormValues(
      values
    );
    props.onSave(meta);
  }
})(formComponent);

interface ContainerProps extends InterfaceProps {
  imageSlideshowReplace: boolean;
  imageCutoutReplace: boolean;
  imageHide: boolean;
  kickerOptions: ArticleTag;
  showByline: boolean;
  showKickerTag: boolean;
  showKickerSection: boolean;
}

interface InterfaceProps {
  form: string;
  articleFragmentId: string;
  onCancel: () => void;
  onSave: (meta: ArticleFragmentMeta) => void;
}

const formContainer: React.SFC<ContainerProps> = props => (
  <ArticleFragmentForm {...props} />
);

const createMapStateToProps = () => {
  const articleSelector = createArticleFromArticleFragmentSelector();
  return (state: State, props: InterfaceProps) => {
    const valueSelector = formValueSelector(props.articleFragmentId);
    const article = articleSelector(
      selectSharedState(state),
      props.articleFragmentId
    );

    return {
      initialValues: getInitialValuesForArticleFragmentForm(article),
      kickerOptions: article
        ? articleTagSelector(
            selectSharedState(state),
            props.articleFragmentId
          )
        : {},
      imageSlideshowReplace: valueSelector(state, 'imageSlideshowReplace'),
      imageHide: valueSelector(state, 'imageHide'),
      imageCutoutReplace: valueSelector(state, 'imageCutoutReplace'),
      showByline: valueSelector(state, 'showByline'),
      showKickerTag: valueSelector(state, 'showKickerTag'),
      showKickerSection: valueSelector(state, 'showKickerSection')
    };
  };
};

export {
  getArticleFragmentMetaFromFormValues,
  getInitialValuesForArticleFragmentForm
};
export default connect(createMapStateToProps)(formContainer);
