// @flow

import React from 'react';
import { connect } from 'react-redux';

import {
  articleFragmentSelector,
  selectSharedState
} from 'shared/selectors/shared';
import { type ArticleFragment } from 'shared/types/Collection';
import ContentContainer from 'shared/components/layout/ContentContainer';
import ContainerHeadingPinline from 'shared/components/typography/ContainerHeadingPinline';
import ButtonPrimary from 'shared/components/input/ButtonPrimary';
import ButtonDefault from 'shared/components/input/ButtonDefault';
import styled from 'styled-components';

const CollectionFormContainer = ContentContainer.extend`
  flex: 1;
  width: 380px;
  margin-left: 10px;
`;

const CollectionHeadingPinline = ContainerHeadingPinline.extend`
  display: flex;
  margin-right: -11px;
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
  articleFragment: ArticleFragment
};

const component = ({ articleFragment, onSave, onCancel }: Props) => (
  <CollectionFormContainer>
    <CollectionHeadingPinline>
      Edit
      <ButtonContainer>
        <ButtonPrimary onClick={onCancel}>Cancel</ButtonPrimary>
        <ButtonDefault onClick={onSave}>Save</ButtonDefault>
      </ButtonContainer>
    </CollectionHeadingPinline>
    {articleFragment && articleFragment.id}
  </CollectionFormContainer>
);

const mapStateToProps = (state, props: PropsBeforeState) => ({
  articleFragment: articleFragmentSelector(
    selectSharedState(state),
    props.articleFragmentId || ''
  )
});

export default connect(mapStateToProps)(component);
