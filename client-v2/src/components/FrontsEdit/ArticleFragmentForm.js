// @flow

import React from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field, type FormProps } from 'redux-form';
import styled from 'styled-components';

import {
  externalArticleFromArticleFragmentSelector,
  selectSharedState
} from 'shared/selectors/shared';
import { type ArticleFragment } from 'shared/types/Collection';
import InputText from 'shared/components/input/InputText';
import InputTextArea from 'shared/components/input/InputTextArea';
import HorizontalRule from 'shared/components/layout/HorizontalRule';
import InputCheckboxToggle from 'shared/components/input/InputCheckboxToggle';
import InputImage from 'shared/components/input/InputImage';
import InputGroup from 'shared/components/input/InputGroup';
import Row from '../Row';
import Col from '../Col';

type Props = {
  articleFragment: ArticleFragment
} & FormProps;

const slideShowImageCount = [1, 2, 3, 4];

const SlideshowRow = Row.extend`
  margin-top: 10px;
  margin-bottom: 5px;
`;

const SlideshowLabel = styled('div')`
  font-size: 12px;
  color: #767676;
`;

const imageCriteria = {
  minWidth: 400,
  widthAspectRatio: 5,
  heightAspectRatio: 3
};

const formComponent = ({ handleSubmit, articleFragmentId }: Props) => (
  <form onSubmit={handleSubmit} name={articleFragmentId}>
    <InputGroup>
      <Field
        name="headline"
        label="Headline"
        component={InputTextArea}
        useHeadlineFont
        rows="2"
      />
      <Field
        name="isLarge"
        component={InputCheckboxToggle}
        label="Large"
        type="checkbox"
      />
      <HorizontalRule noMargin />
      <Field
        name="isQuoted"
        component={InputCheckboxToggle}
        label="Quoted"
        type="checkbox"
      />
      <HorizontalRule noMargin />
      <Field
        name="isBoosted"
        component={InputCheckboxToggle}
        label="Boost"
        type="checkbox"
      />
      <HorizontalRule noMargin />
      <Field name="kicker" label="Kicker" component={InputText} />
      <Field
        name="breakingNews"
        component={InputCheckboxToggle}
        label="Breaking News"
        type="checkbox"
      />
      <HorizontalRule noMargin />
      <Field name="byline" label="Byline" component={InputText} />
      <Field
        name="showByline"
        component={InputCheckboxToggle}
        label="Show Byline"
        type="checkbox"
      />
      <HorizontalRule noMargin />
      <Field name="standfirst" label="Standfirst" component={InputTextArea} />
      <Field name="media" label="Media" component={InputText} />
    </InputGroup>
    <Row>
      <Col>
        <Field name="primaryImage" component={InputImage} />
      </Col>
      <Col>
        <InputGroup>
          <Field
            name="showMedia"
            component={InputCheckboxToggle}
            label="Show media"
            type="checkbox"
          />
          <HorizontalRule noMargin />
          <Field
            name="useCutout"
            component={InputCheckboxToggle}
            label="Use Cutout"
            type="checkbox"
          />
          <HorizontalRule noMargin />
          <Field
            name="slideshow"
            component={InputCheckboxToggle}
            label="Slideshow"
            type="checkbox"
          />
        </InputGroup>
      </Col>
    </Row>
    <SlideshowRow>
      {slideShowImageCount.map(imageNumber => (
        <Col key={imageNumber}>
          <Field
            name={`slideShowImage${imageNumber + 1}`}
            component={InputImage}
            size="small"
            criteria={imageCriteria}
          />
        </Col>
      ))}
    </SlideshowRow>
    <SlideshowLabel>Drag and drop up to four images</SlideshowLabel>
  </form>
);

const articleFragmentForm = reduxForm({
  enableReinitialize: true,
  keepDirtyOnReinitialize: true,
  destroyOnUnmount: false
})(formComponent);

const mapStateToProps = (state, props) => ({
  initialValues: externalArticleFromArticleFragmentSelector(
    selectSharedState(state),
    props.articleFragmentId
  )
});

export default connect(mapStateToProps)(articleFragmentForm);
