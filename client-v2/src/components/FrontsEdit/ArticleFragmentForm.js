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
import pick from 'lodash/pick';
import { updateArticleFragmentMeta } from 'actions/ArticleFragments';
import ButtonPrimary from 'shared/components/input/ButtonPrimary';
import ButtonDefault from 'shared/components/input/ButtonDefault';
import ContentContainer from 'shared/components/layout/ContentContainer';
import ContainerHeadingPinline from 'shared/components/typography/ContainerHeadingPinline';
import {
  articleFromArticleFragmentSelector,
  selectSharedState
} from 'shared/selectors/shared';
import type { DerivedArticle } from 'shared/types/Article';
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
<<<<<<< HEAD
  imageSlideshowReplace: Boolean,
=======
  onCancel: () => void,
  onSave: (meta: ArticleFragmentMeta) => void,
  showSlideshowImages: Boolean,
>>>>>>> Add a way of editing clipboard meta
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
  imageSlideshowReplace,
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

const defaultMeta = {};

const getInitialValuesForArticleFragmentForm = (article: ?DerivedArticle) => {
  if (!article) {
    return {};
  }
  const slideshowBackfill = [];
  const slideshow = article.slideshow || [];
  slideshowBackfill.length = 4 - slideshow.length;
  slideshowBackfill.fill(undefined);
  return article
    ? {
        ...pick(article, [
          'headline',
          'isBoosted',
          'showQuotedHeadline',
          'showBoostedHeadline',
          'customKicker',
          'isBreaking',
          'byline',
          'showByline',
          'trailText',
          'useCutout'
        ]),
        hideMedia: !article.imageReplace,
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
    : defaultMeta;
};

const getArticleFragmentMetaFromFormValues = (values): DerivedArticle => {
  const primaryImage = values.primaryImage || {};
  const cutoutImage = values.cutoutImage || {};
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
      slideshow: compact(values.slideshow)
    },
    'primaryImage',
    'cutoutImage'
  );
};

const articleFragmentForm = reduxForm({
  destroyOnUnmount: false,
  onSubmit: (values, dispatch, props: Props) => {
    const meta: ArticleFragmentMeta = getArticleFragmentMetaFromFormValues(
      values
    );
    props.onSave(meta);
  }
})(
  formValues({
    imageSlideshowReplace: 'imageSlideshowReplace',
    hideMedia: 'hideMedia',
    useCutout: 'useCutout'
  })(formComponent)
);

const mapStateToProps = (state, props) => {
  const article = articleFromArticleFragmentSelector(
    selectSharedState(state),
    props.articleFragmentId
  );
  return {
    initialValues: getInitialValuesForArticleFragmentForm(article)
  };
};

export default connect(mapStateToProps)(articleFragmentForm);
