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
import ButtonPrimary from 'shared/components/input/ButtonPrimary';
import ButtonDefault from 'shared/components/input/ButtonDefault';
import ContentContainer from 'shared/components/layout/ContentContainer';
import ContainerHeadingPinline from 'shared/components/typography/ContainerHeadingPinline';
import {
  articleFromArticleFragmentSelector,
  selectSharedState
} from 'shared/selectors/shared';
import { DerivedArticle } from 'shared/types/Article';
import { ArticleFragmentMeta } from 'shared/types/Collection';
import InputText from 'shared/components/input/InputText';
import InputTextArea from 'shared/components/input/InputTextArea';
import HorizontalRule from 'shared/components/layout/HorizontalRule';
import InputCheckboxToggle from 'shared/components/input/InputCheckboxToggle';
import InputImage from 'shared/components/input/InputImage';
import InputGroup from 'shared/components/input/InputGroup';
import Row from '../Row';
import Col from '../Col';
import { State } from 'types/State';

interface ComponentProps {
  onCancel: () => void;
  onSave: (meta: ArticleFragmentMeta) => void;
  imageSlideshowReplace: boolean;
  useCutout: boolean;
  hideMedia: boolean;
  articleFragmentId: string;
}

type Props = ComponentProps &
  InjectedFormProps<ArticleFragmentFormData, ComponentProps, {}>;

interface ImageData {
  src?: string;
  width?: string;
  height?: string;
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
  hideMedia: boolean;
  primaryImage: ImageData;
  cutoutImage: ImageData;
  useCutout: boolean;
  imageSlideshowReplace: boolean;
  slideshow: Array<ImageData|void>;
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
  handleSubmit,
  imageSlideshowReplace,
  hideMedia,
  useCutout,
  onCancel,
  initialValues,
  pristine
}) => (
  <FormContainer onSubmit={handleSubmit}>
    <CollectionHeadingPinline>
      Edit
      <ButtonContainer>
        <ButtonPrimary onClick={onCancel} type="button">
          Cancel
        </ButtonPrimary>
        <ButtonDefault onClick={handleSubmit} disabled={pristine}>
          Save
        </ButtonDefault>
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
        />
        <Field
          name="isBreaking"
          component={InputCheckboxToggle}
          label="Breaking News"
          type="checkbox"
        />
        <HorizontalRule noMargin />
        <Field
          name="byline"
          label="Byline"
          component={InputText}
          placeholder="Replace byline"
          useHeadlineFont
        />
        <Field
          name="showByline"
          component={InputCheckboxToggle}
          label="Show Byline"
          type="checkbox"
        />
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
            <ImageWrapper faded={hideMedia}>
              <Field
                name="primaryImage"
                component={InputImage}
                disabled={hideMedia}
              />
            </ImageWrapper>
          </Col>
          <Col>
            <InputGroup>
              <Field
                name="hideMedia"
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
            <ImageWrapper faded={!useCutout}>
              <Field
                name="cutoutImage"
                component={InputImage}
                disabled={hideMedia}
              />
            </ImageWrapper>
          </Col>
          <Col>
            <InputGroup>
              <Field
                name="useCutout"
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

const getInitialValuesForArticleFragmentForm = (
  article: DerivedArticle | void
): ArticleFragmentFormData | void => {
  if (!article) {
    return undefined;
  }
  const slideshowBackfill: Array<ImageData | void> = [];
  const slideshow: Array<ImageData | void> = article.slideshow || [];
  slideshowBackfill.length = 4 - slideshow.length;
  slideshowBackfill.fill(undefined);
  return article
    ? {
        headline: article.headline || '',
        isBoosted: article.isBoosted || false,
        showQuotedHeadline: article.showQuotedHeadline || false,
        showBoostedHeadline: article.showBoostedHeadline || false,
        customKicker: article.customKicker || '',
        isBreaking: article.isBreaking || false,
        byline: article.byline || '',
        showByline: article.showByline || false,
        trailText: article.trailText || '',
        useCutout: article.imageCutoutReplace || false,
        hideMedia: !article.imageReplace || false,
        imageSlideshowReplace: article.imageSlideshowReplace || false,
        primaryImage: {
          src: article.imageSrc,
          width: article.imageSrcWidth,
          height: article.imageSrcHeight,
          origin: article.imageSrcOrigin,
          thumb: article.imageSrcThumb
        },
        cutoutImage: {
          src: article.imageCutoutSrc,
          width: article.imageCutoutSrcWidth,
          height: article.imageCutoutSrcHeight,
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
  // Lodash doesn't remove undefined in the type settings here, hence the undefined.
  const slideshow: ImageData[] = compact(values.slideshow as any)
  return omit(
    {
      ...values,
      imageReplace: !values.hideMedia,
      showKickerCustom: !!values.customKicker,
      imageSrc: primaryImage.src,
      imageSrcThumb: primaryImage.thumb,
      imageSrcWidth: primaryImage.width,
      imageSrcHeight: primaryImage.height,
      imageSrcOrigin: primaryImage.origin,
      imageCutoutSrc: cutoutImage.src,
      imageCutoutSrcWidth: cutoutImage.width,
      imageCutoutSrcHeight: cutoutImage.height,
      imageCutoutSrcOrigin: cutoutImage.origin,
      slideshow: slideshow.length ? slideshow : []
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
  onSubmit: (values: ArticleFragmentFormData, _, props: ComponentProps) => {
    const meta: ArticleFragmentMeta = getArticleFragmentMetaFromFormValues(
      values
    );
    props.onSave(meta);
  }
})(formComponent);

interface ContainerProps extends InterfaceProps {
  imageSlideshowReplace: boolean;
  useCutout: boolean;
  hideMedia: boolean;
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

const mapStateToProps = (state: State, props: InterfaceProps) => {
  const valueSelector = formValueSelector(props.articleFragmentId);
  const article = articleFromArticleFragmentSelector(
    selectSharedState(state),
    props.articleFragmentId
  );

  return {
    initialValues: getInitialValuesForArticleFragmentForm(article),
    imageSlideshowReplace: valueSelector(state, 'imageSlideshowReplace'),
    hideMedia: valueSelector(state, 'imageSlideshowReplace'),
    useCutout: valueSelector(state, 'imageSlideshowReplace')
  };
};

export default connect(mapStateToProps)(formContainer);
