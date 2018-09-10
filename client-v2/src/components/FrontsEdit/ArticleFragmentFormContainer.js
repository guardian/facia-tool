// @flow

import React from 'react';
import styled from 'styled-components';

import ContentContainer from 'shared/components/layout/ContentContainer';
import ContainerHeadingPinline from 'shared/components/typography/ContainerHeadingPinline';
import ButtonPrimary from 'shared/components/input/ButtonPrimary';
import ButtonDefault from 'shared/components/input/ButtonDefault';
import ArticleFragmentForm from './ArticleFragmentForm';

const CollectionFormContainer = ContentContainer.extend`
  flex: 1;
  width: 380px;
  margin-left: 10px;
`;

const CollectionHeadingPinline = ContainerHeadingPinline.extend`
  display: flex;
  margin-right: -11px;
  margin-bottom: 10px;
`;

const ButtonContainer = styled('div')`
  margin-left: auto;
  line-height: 0;
`;

type PropsBeforeState = {
  articleFragmentId: ?string, // eslint-disable-line react/no-unused-prop-types
  onCancel: () => void,
  onSave: () => void
};

type Props = PropsBeforeState & {
  articleFragmentId: string
};

export default ({ articleFragmentId, onSave, onCancel }: Props) => (
  <CollectionFormContainer>
    <CollectionHeadingPinline>
      Edit
      <ButtonContainer>
        <ButtonPrimary onClick={onCancel}>Cancel</ButtonPrimary>
        <ButtonDefault onClick={onSave}>Save</ButtonDefault>
      </ButtonContainer>
    </CollectionHeadingPinline>
    <ArticleFragmentForm
      articleFragmentId={articleFragmentId}
      form={articleFragmentId}
      // We provide a key here to force React to re-mount this component
      // when a different articleFragmentId is provided. Without this, redux-form
      // will not propagate the new form name to its field children, because
      // React v15 context is broken.
      //
      // See https://reactjs.org/docs/legacy-context.html#updating-context,
      // e.g. https://github.com/erikras/redux-form/issues/4152
      key={articleFragmentId}
    />
  </CollectionFormContainer>
);
