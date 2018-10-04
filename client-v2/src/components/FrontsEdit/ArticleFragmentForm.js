// @flow

import React from 'react';
import { connect } from 'react-redux';
import {
  reduxForm,
  Field,
  FieldArray,
  type FormProps,
  formValues
} from 'redux-form';
import styled from 'styled-components';
import omit from 'lodash/omit';
import compact from 'lodash/compact';

import { updateArticleFragmentMeta } from 'actions/ArticleFragments';
import ButtonPrimary from 'shared/components/input/ButtonPrimary';
import ButtonDefault from 'shared/components/input/ButtonDefault';
import ContentContainer from 'shared/components/layout/ContentContainer';
import ContainerHeadingPinline from 'shared/components/typography/ContainerHeadingPinline';
import {
  externalArticleFromArticleFragmentSelector,
  selectSharedState,
  articleFragmentSelector
} from 'shared/selectors/shared';
import type { ExternalArticle } from 'shared/types/ExternalArticle';
import type {
  ArticleFragment,
  ArticleFragmentMeta
} from 'shared/types/Collection';
import InputText from 'shared/components/input/InputText';
import InputTextArea from 'shared/components/input/InputTextArea';
import HorizontalRule from 'shared/components/layout/HorizontalRule';
import InputCheckboxToggle from 'shared/components/input/InputCheckboxToggle';
import InputImage from 'shared/components/input/InputImage';
import InputGroup from 'shared/components/input/InputGroup';
import Row from '../Row';
import Col from '../Col';

type Props = {|
  articleFragment: ArticleFragment,
  showSlideshowImages: Boolean,
  useCutout: Boolean,
  hideMedia: Boolean
|} & FormProps;

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
  opacity: ${props => (props.faded ? 0.6 : 1)};
`;

const imageCriteria = {
  minWidth: 400,
  widthAspectRatio: 5,
  heightAspectRatio: 3
};

const renderSlideshow = ({ fields }) =>
  fields.map((name, index) => (
    // eslint-disable-next-line react/no-array-index-key
    <Col key={`${name}-${index}`}>
      <Field
        name={name}
        component={InputImage}
        size="small"
        criteria={imageCriteria}
      />
    </Col>
  ));

const formComponent = ({
  handleSubmit,
  articleFragmentId,
  showSlideshowImages,
  hideMedia,
  useCutout,
  onCancel,
  initialValues,
  pristine
}: Props) => (
  <FormContainer onSubmit={handleSubmit} name={articleFragmentId}>
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
        name="slideshow"
        component={InputCheckboxToggle}
        label="Slideshow"
        type="checkbox"
      />
      {showSlideshowImages && (
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

const defaultMeta = {};

const getInitialValuesForArticleFragmentForm = (
  externalArticle: ?ExternalArticle,
  articleFragment: ?ArticleFragment
) => {
  const slideshowBackfill = [];
  const slideshow =
    (articleFragment &&
      articleFragment.meta &&
      articleFragment.meta.slideshow) ||
    [];
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

const getArticleFragmentMetaFromFormValues = (values): ArticleFragmentMeta =>
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

const articleFragmentForm = reduxForm({
  destroyOnUnmount: false,
  onSubmit: (values, dispatch, props: Props) => {
    const meta: ArticleFragmentMeta = getArticleFragmentMetaFromFormValues(
      values
    );
    dispatch(updateArticleFragmentMeta(props.articleFragmentId, meta));
  }
})(
  formValues({
    showSlideshowImages: 'slideshow',
    hideMedia: 'hideMedia',
    useCutout: 'useCutout'
  })(formComponent)
);

const mapStateToProps = (state, props) => {
  const externalArticle = externalArticleFromArticleFragmentSelector(
    selectSharedState(state),
    props.articleFragmentId
  );
  const articleFragment = articleFragmentSelector(
    selectSharedState(state),
    props.articleFragmentId
  );

  return {
    initialValues: getInitialValuesForArticleFragmentForm(
      externalArticle,
      articleFragment
    )
  };
};

export default connect(mapStateToProps)(articleFragmentForm);
